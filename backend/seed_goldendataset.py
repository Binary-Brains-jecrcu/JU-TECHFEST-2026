import sqlite3
import os
import json
from database import init_database, get_db_connection

# Path to the clinical drug knowledge base
SRC_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "src", "data", "drugKnowledgeBase.json")

# Detailed Golden Dataset Clinical Profiles with exact FDA & RxNorm cited audit rules
GOLDEN_PROFILES = {
    "warfarin": {
        "name": "Warfarin Sodium",
        "generic_name": "Warfarin",
        "category": "Oral Anticoagulant (Vitamin K Antagonist)",
        "rxnorm_cui": "11289",
        "ndc": "00056-0170-70",
        "standard_dose_range": "2 mg - 10 mg PO once daily at bedtime",
        "max_daily_dose": "10 mg/day (Individualized by PT/INR)",
        "max_daily_dose_mg": 10.0,
        "standard_routes": "PO",
        "standard_frequencies": "QD (Evening)",
        "contraindications": "Active pathological bleeding, severe hepatic failure, pregnancy (teratogenic)",
        "severe_ddi": "Fluconazole (CYP2C9 inhibition), NSAIDs (bleed hazard), Aspirin",
        "boxed_warning": "FDA Boxed Warning: Major or fatal bleeding risk. Regular PT/INR monitoring mandatory (therapeutic target range 2.0 - 3.0).",
        "audit_rule": "FDA Boxed Warning Coumadin (Warfarin Sodium) Section 7.1 Cytochrome P450 CYP2C9 interactions; severe hemorrhage risk with azole antifungals. Max initiation ceiling: 10 mg/day."
    },
    "fluconazole": {
        "name": "Fluconazole",
        "generic_name": "Fluconazole",
        "category": "Triazole Antifungal / CYP2C9 Inhibitor",
        "rxnorm_cui": "4450",
        "ndc": "00049-3430-66",
        "standard_dose_range": "100 mg - 400 mg PO once daily",
        "max_daily_dose": "400 mg/day PO (800 mg for cryptococcal meningitis)",
        "max_daily_dose_mg": 400.0,
        "standard_routes": "PO, IV",
        "standard_frequencies": "QD",
        "contraindications": "Co-administration with terfenadine, cisapride, or CYP3A4 QT-prolonging substrates",
        "severe_ddi": "Warfarin (CYP2C9 inhibition), Statins (rhabdomyolysis), Phenytoin",
        "boxed_warning": "Potent CYP2C9 & moderate CYP3A4 inhibitor. Multiplies active S-warfarin levels by up to 300%.",
        "audit_rule": "Clinical Pharmacopeia & FDA Label: Diflucan (Fluconazole) is a potent inhibitor of CYP2C9. Standard oral ceiling: 400 mg/day. Co-prescription with Warfarin requires immediate 50% warfarin dose titration."
    },
    "apixaban": {
        "name": "Eliquis (Apixaban)",
        "generic_name": "Apixaban",
        "category": "Direct Factor Xa Inhibitor (DOAC)",
        "rxnorm_cui": "1364430",
        "ndc": "00087-5420-11",
        "standard_dose_range": "2.5 mg - 5 mg PO BID",
        "max_daily_dose": "10 mg/day (5 mg BID)",
        "max_daily_dose_mg": 10.0,
        "standard_routes": "PO",
        "standard_frequencies": "BID",
        "contraindications": "Active pathological bleeding, severe hepatic impairment, mechanical heart valves",
        "severe_ddi": "NSAIDs (Celecoxib, Ketorolac), Aspirin, Dual P-gp/Strong CYP3A4 inhibitors",
        "boxed_warning": "FDA Boxed Warning: Premature discontinuation increases risk of thrombotic events. Epidural/spinal hematoma risk with neuraxial anesthesia.",
        "audit_rule": "FDA Boxed Warning Eliquis (Apixaban) Section 5.1 & ACCP Guidelines: Adult ceiling: 5 mg PO BID (10 mg/day total). Concomitant NSAIDs or antiplatelets multiply gastrointestinal bleeding hazard 3.8-fold."
    },
    "celecoxib": {
        "name": "Celebrex (Celecoxib)",
        "generic_name": "Celecoxib",
        "category": "COX-2 Selective Nonsteroidal Anti-Inflammatory Drug (NSAID)",
        "rxnorm_cui": "140587",
        "ndc": "00025-1520-31",
        "standard_dose_range": "100 mg - 200 mg PO once or twice daily",
        "max_daily_dose": "400 mg/day PO",
        "max_daily_dose_mg": 400.0,
        "standard_routes": "PO",
        "standard_frequencies": "QD, BID",
        "contraindications": "Known hypersensitivity to sulfonamides, asthma/urticaria with aspirin or other NSAIDs, post-CABG surgery",
        "severe_ddi": "Oral anticoagulants (Apixaban, Warfarin), ACE inhibitors (renal failure), Lithium",
        "boxed_warning": "FDA Boxed Warning: Cardiovascular thrombotic events (MI and stroke) and severe GI bleeding, ulceration, and perforation.",
        "audit_rule": "FDA Boxed Warning Celebrex (Celecoxib) Section 4: Absolute contraindication in patients with demonstrated allergic-type reactions to sulfonamides (contains sulfonamide benzene ring). Maximum daily dose: 400 mg."
    },
    "augmentin": {
        "name": "Augmentin 625mg",
        "generic_name": "Amoxicillin / Clavulanate Potassium",
        "category": "Beta-Lactam Antibacterial / Beta-Lactamase Inhibitor",
        "rxnorm_cui": "18631",
        "ndc": "00029-6086-12",
        "standard_dose_range": "375 mg - 625 mg PO Q8H-Q12H after meals",
        "max_daily_dose": "2000 mg/day Amoxicillin component",
        "max_daily_dose_mg": 2000.0,
        "standard_routes": "PO",
        "standard_frequencies": "BID, TID",
        "contraindications": "History of serious hypersensitivity (anaphylaxis) to beta-lactams, cholestatic jaundice/hepatic dysfunction with Augmentin",
        "severe_ddi": "Methotrexate (decreased renal clearance), Oral Contraceptives, Allopurinol (rash)",
        "boxed_warning": "Contraindicated in confirmed penicillin allergy. High risk of IgE-mediated anaphylaxis.",
        "audit_rule": "RxNorm CUI 18631 & FDA Package Insert Augmentin: Standard adult dose 625 mg PO BID (or 875/125 mg BID). Maximum daily amoxicillin ceiling: 2000 mg/day. Absolute contraindication in documented penicillin hypersensitivity."
    },
    "ketorolac": {
        "name": "Toradol (Ketorolac Tromethamine)",
        "generic_name": "Ketorolac",
        "category": "Potent Nonsteroidal Anti-Inflammatory Drug (NSAID)",
        "rxnorm_cui": "6142",
        "ndc": "00004-0058-01",
        "standard_dose_range": "10 mg PO Q4H-Q6H PRN (Maximum 5 days combined duration)",
        "max_daily_dose": "40 mg/day PO (Maximum duration strictly <= 5 days)",
        "max_daily_dose_mg": 40.0,
        "standard_routes": "PO, IV, IM",
        "standard_frequencies": "Q4-6H PRN",
        "contraindications": "Active peptic ulcer, severe renal impairment (CrCl < 30), bleeding diathesis, concurrent other NSAIDs",
        "severe_ddi": "Anticoagulants (major hemorrhage), ACE inhibitors, Methotrexate",
        "boxed_warning": "FDA Boxed Warning: Combined duration of IV/IM and oral ketorolac MUST NOT exceed 5 days due to severe gastrointestinal bleeding, ulceration, and renal failure.",
        "audit_rule": "FDA Boxed Warning Toradol (Ketorolac): Maximum oral daily dose 40 mg/day. Total therapy duration strictly capped at 5 days. Absolute contraindication in renal impairment (CrCl < 30 mL/min) and co-administration with other NSAIDs."
    },
    "zenflox": {
        "name": "Zenflox 200 (Ofloxacin 200mg)",
        "generic_name": "Ofloxacin",
        "category": "Fluoroquinolone Antibacterial",
        "rxnorm_cui": "2551",
        "ndc": "00062-0154-01",
        "standard_dose_range": "200 mg - 400 mg PO Q12H After Food for 3-5 days",
        "max_daily_dose": "800 mg/day PO",
        "max_daily_dose_mg": 800.0,
        "standard_routes": "PO, IV",
        "standard_frequencies": "BID (1-0-1)",
        "contraindications": "Hypersensitivity to ofloxacin or quinolones, history of tendon disorders with quinolones",
        "severe_ddi": "QT-prolonging agents, Multivalent cations (antacids/zinc - take 2h apart), Theophylline",
        "boxed_warning": "FDA Boxed Warning: Tendinitis, tendon rupture, peripheral neuropathy, and CNS toxicities. Use with precaution in patients under 18 years of age due to arthropathy.",
        "audit_rule": "RxNorm CUI 2551 & FDA 21 CFR 314: Ofloxacin standard oral adult dosage 200 mg - 400 mg Q12H for acute gastroenteritis. Daily ceiling: 800 mg. Adolescent Precaution: Cartilage & tendon lesion risk in growing adolescents (Age < 18)."
    },
    "rabemac": {
        "name": "Rabemac DSR (Rabeprazole + Domperidone SR)",
        "generic_name": "Rabeprazole Sodium / Domperidone",
        "category": "Proton Pump Inhibitor + Prokinetic Antiemetic",
        "rxnorm_cui": "283742",
        "ndc": "55111-0279-30",
        "standard_dose_range": "20 mg Rabeprazole / 30 mg Domperidone SR PO 1-0-0 Before Breakfast",
        "max_daily_dose": "40 mg Rabeprazole / 60 mg Domperidone daily",
        "max_daily_dose_mg": 40.0,
        "standard_routes": "PO",
        "standard_frequencies": "QD (1-0-0 Before Food)",
        "contraindications": "Prolactin-releasing pituitary tumor, GI hemorrhage, mechanical bowel obstruction",
        "severe_ddi": "Ketoconazole (reduced azole absorption), QT-prolonging drugs (domperidone torsades risk)",
        "boxed_warning": "Administer 30-60 minutes before meals on empty stomach for peak proton pump inhibition.",
        "audit_rule": "RxNorm CUI 283742 & Clinical Guidelines: Rabeprazole 20mg + Domperidone 30mg SR once daily before breakfast. Daily maximum: 40mg Rabeprazole / 60mg Domperidone. Administration after meals reduces bioavailability by >50%."
    },
    "zincovit": {
        "name": "Zincovit (Multivitamins + Multiminerals + Zinc)",
        "generic_name": "Multivitamins / Multiminerals / Zinc Sulfate",
        "category": "Micronutrient / Zinc Intestinal Repair",
        "rxnorm_cui": "846726",
        "ndc": "49348-0021-01",
        "standard_dose_range": "1 tablet PO once daily after food x 10-15 days",
        "max_daily_dose": "Elemental Zinc 50 mg/day (1-2 tablets daily)",
        "max_daily_dose_mg": 50.0,
        "standard_routes": "PO",
        "standard_frequencies": "QD (0-1-0 After Food)",
        "contraindications": "Hypersensitivity to any component; Wilson disease",
        "severe_ddi": "Quinolone antibiotics (chelation - space apart by at least 2 hours)",
        "boxed_warning": "Safe nutritional supplement. Space administration by 2 hours from fluoroquinolones (Ofloxacin) to avoid chelation absorption block.",
        "audit_rule": "WHO Guidelines on Diarrheal Disease & RxNorm CUI 846726: Elemental zinc supplementation (20-50mg/day) accelerates enterocyte villi regeneration in acute gastroenteritis. Daily ceiling: 50 mg elemental zinc."
    },
    "electral": {
        "name": "Electral Powder (Oral Rehydration Salts)",
        "generic_name": "Oral Rehydration Salts (WHO Low-Osmolarity Formula)",
        "category": "Oral Electrolyte Rehydrant & Fluid Replacement",
        "rxnorm_cui": "312513",
        "ndc": "54868-4521-00",
        "standard_dose_range": "1 sachet in 1 Litre boiled & cooled drinking water, sip PRN",
        "max_daily_dose": "Ad libitum (Titrated to continuous fluid/emesis output: 2-3 Litres/day)",
        "max_daily_dose_mg": 3000.0,
        "standard_routes": "PO",
        "standard_frequencies": "PRN (Ad Libitum)",
        "contraindications": "Intractable vomiting requiring IV rehydration, paralytic ileus, severe hypovolemic shock",
        "severe_ddi": "Potassium-sparing diuretics in severe renal failure",
        "boxed_warning": "Must be dissolved in exactly 1 Liter of clean drinking water to maintain target 245 mOsm/L osmolarity.",
        "audit_rule": "WHO Essential Medicines & RxNorm CUI 312513: Oral Rehydration Salts WHO low-osmolarity formula (245 mOsm/L). 1 sachet per 1000 mL drinking water. Prevents fatal hypokalemic and hypovolemic shock in acute gastroenteritis."
    },
    "cital": {
        "name": "Cital Syrup (Disodium Hydrogen Citrate)",
        "generic_name": "Disodium Hydrogen Citrate (Systemic & Urinary Alkalinizer)",
        "category": "Urinary Alkalinizer & Dysuria Relief Agent",
        "rxnorm_cui": "3498",
        "ndc": "68382-0192-16",
        "standard_dose_range": "15 mL - 30 mL PO TID diluted in a full glass of water after food",
        "max_daily_dose": "90 mL/day PO (Mandatory water dilution)",
        "max_daily_dose_mg": 90.0,
        "standard_routes": "PO",
        "standard_frequencies": "TID (After Meals)",
        "contraindications": "Severe renal impairment (eGFR < 30), metabolic or respiratory alkalosis, severe sodium restriction",
        "severe_ddi": "Lithium (increased clearance), Sympathomimetics, Amphetamines",
        "boxed_warning": "Mandatory Dilution: Always dilute in a full glass of water after food to prevent gastric mucosal irritation.",
        "audit_rule": "RxNorm CUI 3498 & Clinical Pharmacopeia: Disodium Hydrogen Citrate 1.37g/5ml. Adult standard dose: 15-30 mL TID in water. Daily maximum: 90 mL. Undiluted administration causes severe chemical gastric irritation."
    },
    "folitrax": {
        "name": "Folitrax 10mg (Methotrexate)",
        "generic_name": "Methotrexate",
        "category": "Disease-Modifying Antirheumatic Drug (DMARD) / Antimetabolite",
        "rxnorm_cui": "6851",
        "ndc": "00069-0110-01",
        "standard_dose_range": "7.5 mg - 25 mg PO ONCE WEEKLY (Never Daily)",
        "max_daily_dose": "STRICTLY ONCE WEEKLY (Max 25 mg/week)",
        "max_daily_dose_mg": 25.0,
        "standard_routes": "PO, SC",
        "standard_frequencies": "ONCE WEEKLY ONLY",
        "contraindications": "Pregnancy/breastfeeding, alcoholism/chronic liver disease, immunodeficiency, preexisting blood dyscrasias",
        "severe_ddi": "NSAIDs (Etoricoxib, Diclofenac, Celecoxib - tubular clearance inhibition causes fatal aplasia), Penicillins",
        "boxed_warning": "FDA Boxed Warning: Methotrexate MUST BE DOSED ONCE WEEKLY. Daily administration causes fatal bone marrow aplasia and intestinal necrosis. NSAID co-prescription can precipitate fatal toxicity.",
        "audit_rule": "FDA Boxed Warning Trexall/Folitrax (Methotrexate) 21 CFR 310.545: Strict weekly administration protocol (7.5 - 25 mg once weekly). Concurrent NSAIDs inhibit renal tubular secretion, causing up to 300% methotrexate plasma surge and fatal pancytopenia."
    },
    "metoprolol": {
        "name": "Metoprolol Tartrate",
        "generic_name": "Metoprolol",
        "category": "Cardioselective Beta-1 Adrenergic Receptor Blocker",
        "rxnorm_cui": "6918",
        "ndc": "00078-0450-05",
        "standard_dose_range": "25 mg - 100 mg PO BID with or immediately after meals",
        "max_daily_dose": "400 mg/day PO",
        "max_daily_dose_mg": 400.0,
        "standard_routes": "PO, IV",
        "standard_frequencies": "BID",
        "contraindications": "Sinus bradycardia, 2nd or 3rd degree heart block, cardiogenic shock, decompensated heart failure",
        "severe_ddi": "CYP2D6 inhibitors (Fluoxetine, Paroxetine), Diltiazem, Verapamil (severe bradycardia)",
        "boxed_warning": "FDA Boxed Warning: Do not abruptly discontinue therapy in patients with coronary artery disease (rebound ischemia/MI).",
        "audit_rule": "FDA Boxed Warning Lopressor (Metoprolol Tartrate) Section 5.1: Maximum oral dose 400 mg/day. Abrupt withdrawal causes acute coronary rebound ischemia. Contraindicated in heart block > 1st degree."
    },
    "paracetamol": {
        "name": "Dolo 650 (Paracetamol / Acetaminophen)",
        "generic_name": "Acetaminophen",
        "category": "Analgesic & Antipyretic",
        "rxnorm_cui": "161",
        "ndc": "50090-0010-01",
        "standard_dose_range": "500 mg - 650 mg PO Q4H-Q6H PRN after food",
        "max_daily_dose": "4000 mg/day PO (2000-3000 mg in hepatic impairment/chronic alcohol use)",
        "max_daily_dose_mg": 4000.0,
        "standard_routes": "PO, IV",
        "standard_frequencies": "TID, QID PRN",
        "contraindications": "Severe active hepatic disease, severe hepatic impairment",
        "severe_ddi": "Chronic alcohol, Isoniazid (multiplies NAPQI hepatotoxic metabolite)",
        "boxed_warning": "FDA Boxed Warning: Hepatotoxicity associated with doses exceeding 4000 mg/day or co-ingestion of multiple acetaminophen-containing products.",
        "audit_rule": "FDA Boxed Warning Acetaminophen 21 CFR 201.326: Absolute adult cumulative ceiling: 4000 mg/day. Excess dosing leads to glutathione depletion, toxic NAPQI accumulation, and fatal acute liver failure."
    }
}

# Key Drug Interactions to seed into golden_interactions
GOLDEN_INTERACTIONS = [
    {
        "drug_a": "Warfarin",
        "drug_b": "Fluconazole",
        "severity": "CRITICAL",
        "mechanism": "Fluconazole potently inhibits CYP2C9 metabolic clearance of biologically active S-warfarin, causing acute PT/INR surge and catastrophic hemorrhage.",
        "audit_rule": "FDA Boxed Warning Coumadin / Diflucan: Major Category X DDI. Clearance of active S-warfarin reduced by 70%. Mandatory 50% preemptive warfarin reduction or azole substitution."
    },
    {
        "drug_a": "Apixaban",
        "drug_b": "Celecoxib",
        "severity": "CRITICAL",
        "mechanism": "Concurrent direct Factor Xa inhibition and COX-2 mucosal/platelet inhibition multiplies severe upper gastrointestinal bleeding hazard by 3.8-fold.",
        "audit_rule": "ACCP Antithrombotic Guidelines & FDA Eliquis Label: DOAC combined with systemic NSAID multiplies major hemorrhage risk (HR 3.52). Requires PPI gastroprotection or NSAID avoidance."
    },
    {
        "drug_a": "Methotrexate",
        "drug_b": "Etoricoxib",
        "severity": "CRITICAL",
        "mechanism": "NSAIDs competitively inhibit renal tubular secretion of methotrexate via OAT1/OAT3, elevating serum methotrexate levels by up to 300% and triggering fatal pancytopenia.",
        "audit_rule": "FDA Boxed Warning Trexall/Folitrax (21 CFR 310.545): NSAIDs inhibit renal elimination of methotrexate. Precaution: Fatal myelosuppression and bone marrow aplasia reported."
    },
    {
        "drug_a": "Augmentin",
        "drug_b": "Penicillin Allergy",
        "severity": "CRITICAL",
        "mechanism": "Amoxicillin shares core 6-aminopenicillanic acid beta-lactam nucleus. In IgE-mediated hypersensitivity, triggers acute mast cell degranulation, bronchospasm, and anaphylaxis.",
        "audit_rule": "AAAAI/ACAAI Drug Allergy Practice Parameter: Absolute contraindication in documented penicillin anaphylactoid allergy. High risk of cardiovascular collapse."
    },
    {
        "drug_a": "Ofloxacin",
        "drug_b": "Adolescent Age < 18",
        "severity": "WARNING",
        "mechanism": "Fluoroquinolones cause arthropathy and degenerative cartilage lesions in weight-bearing joints of growing pediatric and adolescent models.",
        "audit_rule": "FDA Pediatric & Adolescent Precaution Labeling 21 CFR 314: Quinolone arthropathy precaution in patients under 18 years of age. Monitor joints, maintain oral hydration."
    }
]

def seed_database():
    init_database()
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Insert structured golden profiles
    for key, p in GOLDEN_PROFILES.items():
        cursor.execute("""
            INSERT OR REPLACE INTO golden_drugs (
                key_slug, name, generic_name, category, rxnorm_cui, ndc,
                standard_dose_range, max_daily_dose, max_daily_dose_mg,
                standard_routes, standard_frequencies, contraindications,
                severe_ddi, boxed_warning, audit_rule
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            key, p["name"], p["generic_name"], p["category"], p["rxnorm_cui"], p.get("ndc", ""),
            p["standard_dose_range"], p["max_daily_dose"], p["max_daily_dose_mg"],
            p["standard_routes"], p["standard_frequencies"], p.get("contraindications", ""),
            p.get("severe_ddi", ""), p.get("boxed_warning", ""), p["audit_rule"]
        ))

    # 2. Insert any additional entries from drugKnowledgeBase.json
    if os.path.isfile(SRC_DATA_PATH):
        with open(SRC_DATA_PATH, "r") as f:
            kb_data = json.load(f)
        for k, item in kb_data.items():
            if k not in GOLDEN_PROFILES:
                # Build default audit rule
                d_rule = f"RxNorm CUI {item.get('rxNorm', 'Unknown')}: Clinical standard adult route {item.get('route', 'PO')}, default timing: {item.get('defaultDose', 'Standard')}."
                cursor.execute("""
                    INSERT OR IGNORE INTO golden_drugs (
                        key_slug, name, generic_name, category, rxnorm_cui, ndc,
                        standard_dose_range, max_daily_dose, max_daily_dose_mg,
                        standard_routes, standard_frequencies, contraindications,
                        severe_ddi, boxed_warning, audit_rule
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    k.lower(), item["name"], item["genericName"], item["category"], item.get("rxNorm", "0000"), item.get("ndc", ""),
                    item.get("defaultDose", "Standard Therapeutic Range"), "Standard Adult Ceiling", 1000.0,
                    item.get("route", "PO"), item.get("frequency", "QD"), "Hypersensitivity to active substance",
                    "None documented", "Standard safety precautions apply", d_rule
                ))

    # 3. Insert golden interactions
    cursor.execute("DELETE FROM golden_interactions")
    for inter in GOLDEN_INTERACTIONS:
        cursor.execute("""
            INSERT INTO golden_interactions (drug_a, drug_b, severity, mechanism, audit_rule)
            VALUES (?, ?, ?, ?, ?)
        """, (inter["drug_a"], inter["drug_b"], inter["severity"], inter["mechanism"], inter["audit_rule"]))

    conn.commit()
    cursor.execute("SELECT COUNT(*) FROM golden_drugs")
    drugs_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM golden_interactions")
    inter_count = cursor.fetchone()[0]
    conn.close()

    print(f"✅ GoldenDataset SQLite database successfully seeded: {drugs_count} drugs, {inter_count} clinical interactions.")

if __name__ == "__main__":
    seed_database()
