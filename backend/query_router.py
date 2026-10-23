#!/usr/bin/env python3
"""
MedCheck CDSS — Query Router (Step 2 of CDSS Pipeline)
-------------------------------------------------------
Architecture Role:
Takes Extracted JSON from Step 1 (PaddleOCR + Qwen-VL) and bifurcates
each medication:
  - If drug found in local DB -> 3A. Fast Path (Local SQLite Rules) -> 4A. Python Rules Engine
  - If drug NOT found in local DB -> 3B. Slow Path (CodeRx API Fetch) -> 4B. MedGemma -> 5B. Lynx
Also supports Write-Through Caching to promote newly fetched CodeRx drugs to Fast Path.
"""

import os
import sys
import sqlite3
import json
import difflib
import time
from typing import Dict, List, Optional, Any, Tuple

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

DEFAULT_DB_PATH = os.path.join(os.path.dirname(__file__), "clinical_rules.db")

# Initial seed data for common inpatient & ambulatory medications
SEED_DRUGS = [
    {
        "generic_name": "Warfarin",
        "brand_aliases": ["Coumadin", "Jantoven", "Warf"],
        "rxcui": "11289",
        "drug_class": "Vitamin K Antagonist Anticoagulant",
        "category": "Oral Anticoagulant",
        "max_daily_dose_mg": 10.0,
        "standard_dose": "5 mg PO QD at bedtime",
        "contraindications": [
            "Severe active bleeding",
            "Pregnancy (Category X except mechanical heart valve)",
            "Malignant hypertension",
            "Severe hepatic failure"
        ],
        "black_box_warnings": [
            "Major or fatal hemorrhage risk; requires regular INR monitoring (target 2.0-3.0)."
        ],
        "major_ddi": [
            {"drug": "Fluconazole", "severity": "CRITICAL", "mechanism": "CYP2C9 inhibition raises Warfarin AUC >70%, severe INR spike"},
            {"drug": "Amiodarone", "severity": "CRITICAL", "mechanism": "Potent CYP2C9/3A4 inhibition; decreases Warfarin clearance by 50%"},
            {"drug": "Celecoxib", "severity": "HIGH", "mechanism": "Synergistic GI mucosal bleed risk via COX-2 inhibition"},
            {"drug": "Aspirin", "severity": "HIGH", "mechanism": "Antiplatelet synergy dramatically increases bleeding hazard"}
        ],
        "renal_adjustment_egfr": None,
        "beers_criteria": 1
    },
    {
        "generic_name": "Fluconazole",
        "brand_aliases": ["Diflucan", "Forcan", "Syscan"],
        "rxcui": "4450",
        "drug_class": "Triazole Antifungal",
        "category": "Antifungal",
        "max_daily_dose_mg": 400.0,
        "standard_dose": "150-200 mg PO QD",
        "contraindications": [
            "Coadministration with terfenadine or cisapride (QT prolongation hazard)"
        ],
        "black_box_warnings": [],
        "major_ddi": [
            {"drug": "Warfarin", "severity": "CRITICAL", "mechanism": "Potent CYP2C9 inhibition causing dangerous INR escalation"}
        ],
        "renal_adjustment_egfr": 50.0,
        "beers_criteria": 0
    },
    {
        "generic_name": "Metformin",
        "brand_aliases": ["Glucophage", "Glycomet", "Riomet", "Fortamet"],
        "rxcui": "6809",
        "drug_class": "Biguanide",
        "category": "Antidiabetic",
        "max_daily_dose_mg": 2000.0,
        "standard_dose": "500-1000 mg PO BID with meals",
        "contraindications": [
            "Severe renal impairment (eGFR < 30 mL/min/1.73m2)",
            "Acute or chronic metabolic acidosis, including diabetic ketoacidosis"
        ],
        "black_box_warnings": [
            "Lactic acidosis risk, especially in renal dysfunction or sepsis."
        ],
        "major_ddi": [
            {"drug": "Iodinated Radiocontrast", "severity": "HIGH", "mechanism": "Contrast-induced nephropathy precipitates lactic acidosis"}
        ],
        "renal_adjustment_egfr": 45.0,
        "beers_criteria": 0
    },
    {
        "generic_name": "Apixaban",
        "brand_aliases": ["Eliquis"],
        "rxcui": "1364430",
        "drug_class": "Direct Factor Xa Inhibitor (DOAC)",
        "category": "Oral Anticoagulant",
        "max_daily_dose_mg": 10.0,
        "standard_dose": "5 mg PO BID (2.5 mg BID if renal/age/weight criteria met)",
        "contraindications": [
            "Active pathological bleeding",
            "Severe hepatic impairment (Child-Pugh C)"
        ],
        "black_box_warnings": [
            "Premature discontinuation increases risk of thrombotic stroke.",
            "Epidural or spinal hematoma risk with neuraxial anesthesia."
        ],
        "major_ddi": [
            {"drug": "Celecoxib", "severity": "HIGH", "mechanism": "Concurrent NSAID increases major upper GI bleeding risk 3.8x"},
            {"drug": "Ketoconazole", "severity": "HIGH", "mechanism": "Strong dual CYP3A4 and P-gp inhibitor increases apixaban exposure"}
        ],
        "renal_adjustment_egfr": 25.0,
        "beers_criteria": 1
    },
    {
        "generic_name": "Celecoxib",
        "brand_aliases": ["Celebrex", "Cobix", "Celact"],
        "rxcui": "140587",
        "drug_class": "COX-2 Selective NSAID",
        "category": "Nonsteroidal Anti-inflammatory",
        "max_daily_dose_mg": 400.0,
        "standard_dose": "100-200 mg PO QD or BID",
        "contraindications": [
            "Documented hypersensitivity to sulfonamides ('sulfa allergy')",
            "History of asthma or urticaria post-aspirin/NSAIDs",
            "Post-CABG surgery setting"
        ],
        "black_box_warnings": [
            "Cardiovascular thrombotic events, myocardial infarction, and stroke.",
            "Gastrointestinal bleeding, ulceration, and perforation."
        ],
        "major_ddi": [
            {"drug": "Apixaban", "severity": "HIGH", "mechanism": "Multiplies gastrointestinal bleeding hazard"},
            {"drug": "Warfarin", "severity": "HIGH", "mechanism": "Potentiates anticoagulant effect and GI hemorrhage"}
        ],
        "renal_adjustment_egfr": 30.0,
        "beers_criteria": 1
    },
    {
        "generic_name": "Methotrexate",
        "brand_aliases": ["Folitrax", "Trexall", "Otrexup", "Rasuvo"],
        "rxcui": "6851",
        "drug_class": "Antimetabolite / Antifolate",
        "category": "DMARD (Immunosuppressant)",
        "max_daily_dose_mg": 25.0,  # Weekly dose!
        "standard_dose": "7.5-15 mg PO ONCE WEEKLY (Never daily for arthritis)",
        "contraindications": [
            "Pregnancy (severe teratogen)",
            "Pre-existing blood dyscrasias / bone marrow aplasia",
            "Chronic liver disease / cirrhosis"
        ],
        "black_box_warnings": [
            "FATAL DOSING ERRORS: Daily administration instead of weekly dosing causes fatal bone marrow suppression.",
            "Concomitant NSAID use impairs renal clearance, causing fatal pancytopenia."
        ],
        "major_ddi": [
            {"drug": "Etoricoxib", "severity": "CRITICAL", "mechanism": "NSAID impairs renal tubular secretion, raising plasma MTX >300%"},
            {"drug": "Tofacitinib", "severity": "HIGH", "mechanism": "Dual immunosuppression multiplying severe opportunistic infection risk"}
        ],
        "renal_adjustment_egfr": 50.0,
        "beers_criteria": 0
    },
    {
        "generic_name": "Etoricoxib",
        "brand_aliases": ["Arcoxia", "Retoz", "Nucoxia", "Etoshine"],
        "rxcui": "334791",
        "drug_class": "COX-2 Selective NSAID",
        "category": "Nonsteroidal Anti-inflammatory",
        "max_daily_dose_mg": 120.0,
        "standard_dose": "60-90 mg PO QD",
        "contraindications": [
            "Active peptic ulceration or active GI bleeding",
            "Uncontrolled hypertension (>140/90 mmHg)",
            "Severe hepatic dysfunction"
        ],
        "black_box_warnings": [
            "Increased risk of serious cardiovascular events and GI mucosal lesions."
        ],
        "major_ddi": [
            {"drug": "Methotrexate", "severity": "CRITICAL", "mechanism": "Inhibits renal clearance of MTX causing bone marrow toxicity"}
        ],
        "renal_adjustment_egfr": 30.0,
        "beers_criteria": 1
    },
    {
        "generic_name": "Amoxicillin / Clavulanate",
        "brand_aliases": ["Augmentin", "Clavam", "Moxikind-CV", "Amoxyclav"],
        "rxcui": "617318",
        "drug_class": "Beta-Lactam + Beta-Lactamase Inhibitor",
        "category": "Antibacterial",
        "max_daily_dose_mg": 2000.0,
        "standard_dose": "625 mg PO BID or TID",
        "contraindications": [
            "Documented IgE-mediated anaphylaxis to penicillins",
            "History of amoxicillin/clavulanate-associated cholestatic jaundice"
        ],
        "black_box_warnings": [],
        "major_ddi": [
            {"drug": "Methotrexate", "severity": "MODERATE", "mechanism": "Decreases renal tubular excretion of methotrexate"}
        ],
        "renal_adjustment_egfr": 30.0,
        "beers_criteria": 0
    },
    {
        "generic_name": "Cephalexin",
        "brand_aliases": ["Keflex", "Phexin", "Sporidex"],
        "rxcui": "2231",
        "drug_class": "First-Generation Cephalosporin",
        "category": "Antibacterial",
        "max_daily_dose_mg": 4000.0,
        "standard_dose": "250-500 mg PO QID",
        "contraindications": [
            "True IgE-mediated anaphylaxis to cephalosporins or ampicillin/amoxicillin (shared R1 side-chain)"
        ],
        "black_box_warnings": [],
        "major_ddi": [
            {"drug": "Metformin", "severity": "MODERATE", "mechanism": "Competes for renal tubular secretion, raising metformin levels"}
        ],
        "renal_adjustment_egfr": 40.0,
        "beers_criteria": 0
    },
    {
        "generic_name": "Atorvastatin",
        "brand_aliases": ["Lipitor", "Atorva", "Storvas", "Tonact"],
        "rxcui": "83367",
        "drug_class": "HMG-CoA Reductase Inhibitor (Statin)",
        "category": "Antilipemic",
        "max_daily_dose_mg": 80.0,
        "standard_dose": "10-40 mg PO QD",
        "contraindications": [
            "Active liver disease or unexplained persistent elevation of hepatic transaminases",
            "Pregnancy and lactation"
        ],
        "black_box_warnings": [],
        "major_ddi": [
            {"drug": "Clarithromycin", "severity": "HIGH", "mechanism": "Strong CYP3A4 inhibition raises statin exposure -> rhabdomyolysis risk"}
        ],
        "renal_adjustment_egfr": None,
        "beers_criteria": 0
    },
    {
        "generic_name": "Clopidogrel",
        "brand_aliases": ["Plavix", "Clopilet", "Deplatt", "Clopitab"],
        "rxcui": "32968",
        "drug_class": "P2Y12 Platelet Inhibitor",
        "category": "Antiplatelet",
        "max_daily_dose_mg": 75.0,
        "standard_dose": "75 mg PO QD (300 mg loading dose in ACS)",
        "contraindications": [
            "Active pathological bleeding (e.g. peptic ulcer or intracranial hemorrhage)"
        ],
        "black_box_warnings": [
            "Diminished antiplatelet effect in CYP2C19 poor metabolizers."
        ],
        "major_ddi": [
            {"drug": "Omeprazole", "severity": "HIGH", "mechanism": "CYP2C19 inhibition prevents conversion of clopidogrel to active metabolite"}
        ],
        "renal_adjustment_egfr": None,
        "beers_criteria": 0
    },
    {
        "generic_name": "Pantoprazole",
        "brand_aliases": ["Protonix", "Pantocid", "Pan 40", "Pantodac", "Pantadif"],
        "rxcui": "40790",
        "drug_class": "Proton Pump Inhibitor (PPI)",
        "category": "Gastric Acid Reducer",
        "max_daily_dose_mg": 80.0,
        "standard_dose": "40 mg PO QD before breakfast",
        "contraindications": [
            "Known hypersensitivity to substituted benzimidazoles"
        ],
        "black_box_warnings": [],
        "major_ddi": [
            {"drug": "Methotrexate", "severity": "MODERATE", "mechanism": "PPIs may elevate and prolong methotrexate serum levels"}
        ],
        "renal_adjustment_egfr": None,
        "beers_criteria": 1  # Beers caution for chronic C. diff / bone loss in geriatrics
    }
]


class QueryRouter:
    """
    Step 2: Query Router Engine
    Bifurcates medication queries between:
      - Fast Path (Local SQLite deterministic rules)
      - Slow Path (CodeRx API fetch -> MedGemma -> Lynx)
    """

    def __init__(self, db_path: str = DEFAULT_DB_PATH):
        self.db_path = db_path
        self._init_database()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_database(self):
        """Initializes SQLite schema and populates seed data if empty."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS clinical_rules (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    generic_name TEXT NOT NULL UNIQUE,
                    brand_aliases TEXT,
                    rxcui TEXT,
                    drug_class TEXT,
                    category TEXT,
                    max_daily_dose_mg REAL,
                    standard_dose TEXT,
                    contraindications TEXT,
                    black_box_warnings TEXT,
                    major_ddi TEXT,
                    renal_adjustment_egfr REAL,
                    beers_criteria INTEGER DEFAULT 0,
                    source TEXT DEFAULT 'local_seed',
                    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_generic_name ON clinical_rules(generic_name);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_rxcui ON clinical_rules(rxcui);")
            conn.commit()

            # Seed if empty
            cursor.execute("SELECT COUNT(*) as count FROM clinical_rules;")
            row = cursor.fetchone()
            if row["count"] == 0:
                self._seed_database(conn)

    def _seed_database(self, conn: sqlite3.Connection):
        """Seeds the database with core inpatient medications."""
        cursor = conn.cursor()
        for item in SEED_DRUGS:
            cursor.execute("""
                INSERT OR IGNORE INTO clinical_rules (
                    generic_name, brand_aliases, rxcui, drug_class, category,
                    max_daily_dose_mg, standard_dose, contraindications,
                    black_box_warnings, major_ddi, renal_adjustment_egfr,
                    beers_criteria, source
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'local_seed');
            """, (
                item["generic_name"],
                json.dumps(item["brand_aliases"]),
                item["rxcui"],
                item["drug_class"],
                item["category"],
                item["max_daily_dose_mg"],
                item["standard_dose"],
                json.dumps(item["contraindications"]),
                json.dumps(item["black_box_warnings"]),
                json.dumps(item["major_ddi"]),
                item["renal_adjustment_egfr"],
                item["beers_criteria"]
            ))
        conn.commit()

    def find_in_local_db(self, drug_query: str) -> Optional[Dict[str, Any]]:
        """
        Checks if drug exists in local SQLite DB by:
        1. Exact generic name match (case-insensitive)
        2. Exact brand alias match in JSON list
        3. Fuzzy match across generic and brand names
        """
        if not drug_query or not drug_query.strip():
            return None

        clean_query = drug_query.strip().lower()

        with self._get_connection() as conn:
            cursor = conn.cursor()

            # 1. Direct generic name match
            cursor.execute("SELECT * FROM clinical_rules WHERE LOWER(generic_name) = ?;", (clean_query,))
            row = cursor.fetchone()
            if row:
                return self._row_to_dict(row)

            # 2. Match brand alias inside JSON array
            cursor.execute("SELECT * FROM clinical_rules;")
            all_rows = cursor.fetchall()
            for r in all_rows:
                aliases_raw = r["brand_aliases"]
                if aliases_raw:
                    try:
                        aliases = json.loads(aliases_raw)
                        if any(clean_query == str(a).strip().lower() for a in aliases):
                            return self._row_to_dict(r)
                    except Exception:
                        pass

            # 3. Substring / Prefix match
            for r in all_rows:
                g_name = r["generic_name"].lower()
                if clean_query in g_name or g_name in clean_query:
                    return self._row_to_dict(r)

            # 4. Fuzzy fallback (tolerates handwriting OCR character noise)
            candidates = {}
            for r in all_rows:
                candidates[r["generic_name"].lower()] = r
                if r["brand_aliases"]:
                    try:
                        for a in json.loads(r["brand_aliases"]):
                            candidates[str(a).lower()] = r
                    except Exception:
                        pass

            matches = difflib.get_close_matches(clean_query, candidates.keys(), n=1, cutoff=0.75)
            if matches:
                matched_row = candidates[matches[0]]
                return self._row_to_dict(matched_row)

        return None

    def _row_to_dict(self, row: sqlite3.Row) -> Dict[str, Any]:
        """Converts SQLite Row to clean Python dictionary with deserialized JSON fields."""
        data = dict(row)
        for json_field in ["brand_aliases", "contraindications", "black_box_warnings", "major_ddi"]:
            if data.get(json_field):
                try:
                    data[json_field] = json.loads(data[json_field])
                except Exception:
                    data[json_field] = []
            else:
                data[json_field] = []
        return data

    def route_drug(self, drug_input: Any) -> Dict[str, Any]:
        """
        Step 2 Decision Logic for a single medication:
        Returns routing metadata and targets:
          - FAST_PATH (Handler 4A: Python Rules Engine)
          - SLOW_PATH (Handler 3B: CodeRx API Fetch -> 4B: MedGemma -> 5B: Lynx)
        """
        if isinstance(drug_input, dict):
            raw_name = drug_input.get("name") or drug_input.get("genericName") or ""
            dosage = drug_input.get("dose") or drug_input.get("dosage") or ""
            frequency = drug_input.get("frequency") or ""
            input_meta = drug_input
        else:
            raw_name = str(drug_input)
            dosage = ""
            frequency = ""
            input_meta = {"name": raw_name}

        matched_rule = self.find_in_local_db(raw_name)

        if matched_rule is not None:
            return {
                "drug_name": raw_name,
                "path": "FAST_PATH",
                "is_local": True,
                "matched_generic": matched_rule["generic_name"],
                "rxcui": matched_rule["rxcui"],
                "target_step": "4A. Python Rules Engine (Deterministic Check)",
                "rules": matched_rule,
                "input_metadata": input_meta
            }
        else:
            return {
                "drug_name": raw_name,
                "path": "SLOW_PATH",
                "is_local": False,
                "target_step": "3B. Slow Path (CodeRx API Fetch)",
                "reason": "DRUG_NOT_IN_LOCAL_DB",
                "next_pipeline": [
                    "3B. CodeRx API Fetch",
                    "4B. MedGemma Engine (AI Evaluation)",
                    "5B. Lynx Gatekeeper (Hallucination Check)"
                ],
                "input_metadata": input_meta
            }

    def route_prescription(self, extracted_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes full Extracted JSON payload from Step 1 (PaddleOCR + Qwen-VL).
        Categorizes extracted medications into Fast Path vs Slow Path sets.
        """
        start_time = time.time()
        drugs_list = extracted_json.get("drugs", [])
        patient = extracted_json.get("patient", {})

        fast_path_items = []
        slow_path_items = []

        for drug in drugs_list:
            routing_decision = self.route_drug(drug)
            if routing_decision["is_local"]:
                fast_path_items.append(routing_decision)
            else:
                slow_path_items.append(routing_decision)

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "step": "2. Query Router",
            "execution_time_ms": elapsed_ms,
            "patient_context": patient,
            "total_drugs": len(drugs_list),
            "fast_path_count": len(fast_path_items),
            "slow_path_count": len(slow_path_items),
            "fast_path_drugs": fast_path_items,
            "slow_path_drugs": slow_path_items,
            "execution_strategy": {
                "run_deterministic_4A": len(fast_path_items) > 0,
                "trigger_coderx_medgemma_lynx": len(slow_path_items) > 0
            }
        }

    def cache_external_drug(self, drug_rules: Dict[str, Any]) -> bool:
        """
        Write-Through Cache:
        When a Slow Path drug completes Lynx verification, save it to SQLite.
        Subsequent queries for this drug will immediately hit Fast Path.
        """
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO clinical_rules (
                        generic_name, brand_aliases, rxcui, drug_class, category,
                        max_daily_dose_mg, standard_dose, contraindications,
                        black_box_warnings, major_ddi, renal_adjustment_egfr,
                        beers_criteria, source
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'coderx_verified_cache');
                """, (
                    drug_rules.get("generic_name"),
                    json.dumps(drug_rules.get("brand_aliases", [])),
                    drug_rules.get("rxcui", ""),
                    drug_rules.get("drug_class", "Unspecified"),
                    drug_rules.get("category", "General"),
                    drug_rules.get("max_daily_dose_mg"),
                    drug_rules.get("standard_dose", ""),
                    json.dumps(drug_rules.get("contraindications", [])),
                    json.dumps(drug_rules.get("black_box_warnings", [])),
                    json.dumps(drug_rules.get("major_ddi", [])),
                    drug_rules.get("renal_adjustment_egfr"),
                    drug_rules.get("beers_criteria", 0)
                ))
                conn.commit()
                return True
        except Exception as e:
            print(f"Failed to cache external drug: {e}")
            return False


# --- Self-Test Demonstration when run directly ---
if __name__ == "__main__":
    print("=" * 70)
    print("🚀 MEDCHECK CDSS — STEP 2: QUERY ROUTER INITIALIZATION")
    print("=" * 70)

    router = QueryRouter()
    print(f"✅ SQLite Database initialized at: {router.db_path}")

    # Simulated Step 1 output from PaddleOCR + Qwen-VL
    mock_step1_output = {
        "patient": {
            "name": "Eleanor Vance",
            "age": 68,
            "eGFR": 42.0,
            "allergies": ["Penicillins"]
        },
        "drugs": [
            {"name": "Warfarin Sodium", "dose": "5 mg", "frequency": "QD"},
            {"name": "Diflucan", "dose": "200 mg", "frequency": "QD"},         # Brand for Fluconazole
            {"name": "Foltrax", "dose": "15 mg", "frequency": "Weekly"},       # Slight OCR typo for Folitrax
            {"name": "Zavegepant Nasal", "dose": "10 mg", "frequency": "PRN"}  # Novel rare CGRP inhibitor (Not in local DB)
        ]
    }

    print("\n🔍 INGESTING PRESCRIPTION DRUGS (STEP 1 EXTRACTED JSON):")
    for d in mock_step1_output["drugs"]:
        print(f"   • {d['name']} ({d['dose']} {d['frequency']})")

    # Run Query Router
    routed = router.route_prescription(mock_step1_output)

    print("\n" + "=" * 70)
    print(f"📊 ROUTING SUMMARY (Resolved in {routed['execution_time_ms']} ms):")
    print(f"   Total Drugs: {routed['total_drugs']}")
    print(f"   ⚡ Fast Path (Local SQLite): {routed['fast_path_count']}")
    print(f"   ⏳ Slow Path (CodeRx / MedGemma / Lynx): {routed['slow_path_count']}")
    print("=" * 70)

    print("\n⚡ FAST PATH DISPATCH (To Step 4A Deterministic Engine):")
    for item in routed["fast_path_drugs"]:
        rule = item["rules"]
        print(f"   ▶ {item['drug_name']} -> Matched: {item['matched_generic']} (RxCUI: {item['rxcui']})")
        print(f"     Class: {rule['drug_class']} | Max Daily Dose: {rule['max_daily_dose_mg']} mg")
        print(f"     Known DDIs: {[ddi['drug'] for ddi in rule['major_ddi']]}")

    print("\n⏳ SLOW PATH DISPATCH (To Step 3B CodeRx API -> 4B MedGemma -> 5B Lynx):")
    for item in routed["slow_path_drugs"]:
        print(f"   ▶ {item['drug_name']}")
        print(f"     Reason: {item['reason']}")
        print(f"     Pipeline: {' -> '.join(item['next_pipeline'])}")

    print("\n✅ Query Router self-test completed successfully.\n")
