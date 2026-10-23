from typing import Dict, Any, List
from database import query_golden_drug
from fast_path import evaluate_fast_path
from external_llm import fetch_coderx_rules, evaluate_with_medgemma, verify_with_lynx_8b

# MANDATORY LEGAL DISCLAIMER TO FORCE-INJECT
LEGAL_DISCLAIMER = "Prototype Limits: No pediatric dosing"

def route_and_evaluate_prescription(ocr_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main Clinical Decision Support Query Router & Evaluator:
    1. Checks if extracted drugs exist in SQLite 'GoldenDataset'.
    2. If YES -> Fast Path (Strict SQL query + deterministic Python calculation; NO LLM).
    3. If NO -> Slow Path (CodeRx API -> MedGemma 1.5-4B -> Lynx 8B Hallucination Guard).
    4. Convergence: Force-injects hardcoded legal disclaimer into the final JSON payload.
    """
    extracted_drugs = ocr_json.get("drugs", [])
    patient_context = ocr_json.get("patient", {})

    evaluated_drugs = []
    routes_taken = []
    lynx_verdicts = []

    for drug in extracted_drugs:
        drug_name = drug.get("name", "")
        # Query local SQLite GoldenDataset
        golden_entry = query_golden_drug(drug_name)

        if golden_entry:
            # ================= FAST PATH (LOCAL DB) =================
            # Strict SQL query executed. Flags computed via deterministic Python function. NO LLM.
            fast_res = evaluate_fast_path(
                extracted_drug=drug,
                golden_entry=golden_entry,
                patient_context=patient_context,
                all_prescribed_drugs=extracted_drugs
            )
            evaluated_drugs.append(fast_res)
            routes_taken.append("Fast Path (Local DB)")
        else:
            # ================= SLOW PATH (EXTERNAL LLMS) =================
            # 1. Fetch rules from CodeRx API
            coderx_rules = fetch_coderx_rules(drug_name, patient_context)

            # 2. Pass CodeRx rules + OCR JSON to MedGemma 1.5-4b-it API
            drug_ocr = {"drug": drug, "patient": patient_context}
            medgemma_res = evaluate_with_medgemma(coderx_rules, drug_ocr)

            # 3. Pass MedGemma's output to Lynx 8B API for hallucination checking
            lynx_res = verify_with_lynx_8b(medgemma_res, coderx_rules)
            lynx_verdicts.append(lynx_res)

            slow_res = {
                "drug_name": medgemma_res.get("drug_name", drug_name),
                "generic_name": drug.get("genericName", drug_name),
                "prescribed_dose": drug.get("dose", ""),  # STRICTLY UNMODIFIED READ-ONLY
                "route": drug.get("route", "PO"),
                "frequency": drug.get("frequency", "QD"),
                "rxnorm_cui": drug.get("rxNorm", "N/A"),
                "status": medgemma_res.get("status", "appropriate"),
                "label": medgemma_res.get("label", "CodeRx / MedGemma Evaluated"),
                "badge_color": medgemma_res.get("badge_color", "emerald"),
                "audit_trail": medgemma_res.get("audit_trail", "CodeRx Clinical Guidelines"),
                "explanation": medgemma_res.get("clinical_rationale", ""),
                "hallucination_check": lynx_res,
                "execution_path": "Slow Path (External LLMs: CodeRx + MedGemma + Lynx 8B)"
            }
            evaluated_drugs.append(slow_res)
            routes_taken.append("Slow Path (External LLMs)")

    # Overall prescription route
    primary_route = (
        "Slow Path (External LLMs: CodeRx + MedGemma 1.5-4b-it + Lynx 8B)"
        if "Slow Path (External LLMs)" in routes_taken
        else "Fast Path (Local SQLite GoldenDataset - Deterministic Python)"
    )

    # CONVERGENCE: Force-inject hardcoded legal disclaimer
    return {
        "success": True,
        "route_taken": primary_route,
        "patient": patient_context,
        "drugs": evaluated_drugs,
        "ocrLines": ocr_json.get("ocrLines", []),
        "lynx_hallucination_verdicts": lynx_verdicts if lynx_verdicts else None,
        "legal_disclaimer": LEGAL_DISCLAIMER  # CONVERGENCE HARDCODED INJECTION
    }
