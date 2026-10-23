import pytest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from router import route_and_evaluate_prescription, LEGAL_DISCLAIMER

def test_slow_path_executes_coderx_medgemma_lynx():
    """
    CRITICAL TEST: Verifies that when an unindexed drug is detected (NOT in SQLite GoldenDataset),
    the Query Router directs the request to the Slow Path:
    1. Fetches CodeRx rules.
    2. Passes CodeRx rules + OCR JSON to MedGemma 1.5-4B.
    3. Passes MedGemma output to Lynx 8B for hallucination checking.
    """
    mock_ocr_input = {
        "patient": {
            "name": "Jane Doe",
            "age": 42,
            "gender": "Female",
            "renalLabs": {"crCl": 85},
            "allergies": []
        },
        "drugs": [
            {
                "name": "Novasporin 500",
                "genericName": "Cephalosporin Novel Compound",
                "dose": "500 mg PO TID After Meals x 7 days",
                "route": "PO",
                "frequency": "TID"
            }
        ],
        "ocrLines": ["Novasporin 500 mg TID x 7 days"]
    }

    mock_coderx_rules = [
        "CodeRx Rule CRX-CEPH-01: First-generation cephalosporin; adult ceiling 2000 mg/day PO.",
        "CodeRx Rule CRX-CEPH-02: Monitor for hypersensitivity and renal tolerance."
    ]

    mock_medgemma_output = {
        "drug_name": "Novasporin 500",
        "prescribed_dose": "500 mg PO TID After Meals x 7 days",
        "status": "appropriate",
        "label": "CodeRx Grounded Dose",
        "badge_color": "emerald",
        "audit_trail": "CodeRx Rule CRX-CEPH-01: First-generation cephalosporin; adult ceiling 2000 mg/day PO.",
        "clinical_rationale": "MedGemma verified daily dose of 1500mg does not exceed 2000mg ceiling."
    }

    mock_lynx_output = {
        "verdict": "Pass",
        "hallucination_detected": False,
        "hallucination_score": 0.04,
        "reasoning": "Lynx 8B verified MedGemma output is faithful to CodeRx rule CRX-CEPH-01.",
        "audit_trail": "PatronusAI Lynx-8B Hallucination Protocol"
    }

    with patch("router.fetch_coderx_rules", return_value=mock_coderx_rules) as mock_fetch_rules:
        with patch("router.evaluate_with_medgemma", return_value=mock_medgemma_output) as mock_medgemma:
            with patch("router.verify_with_lynx_8b", return_value=mock_lynx_output) as mock_lynx:
                result = route_and_evaluate_prescription(mock_ocr_input)

                # 1. Verify CodeRx API was called
                mock_fetch_rules.assert_called_once_with("Novasporin 500", mock_ocr_input["patient"])

                # 2. Verify MedGemma was called with CodeRx rules and drug OCR
                mock_medgemma.assert_called_once()
                args, _ = mock_medgemma.call_args
                assert args[0] == mock_coderx_rules
                assert args[1]["drug"]["name"] == "Novasporin 500"

                # 3. Verify Lynx 8B was called with MedGemma output
                mock_lynx.assert_called_once_with(mock_medgemma_output, mock_coderx_rules)

    # 4. Verify Route & Structure
    assert "Slow Path" in result["route_taken"]
    assert len(result["drugs"]) == 1

    evaluated_drug = result["drugs"][0]
    assert evaluated_drug["drug_name"] == "Novasporin 500"
    assert evaluated_drug["prescribed_dose"] == "500 mg PO TID After Meals x 7 days"  # READ-ONLY UNMODIFIED
    assert evaluated_drug["audit_trail"] == mock_medgemma_output["audit_trail"]
    assert evaluated_drug["hallucination_check"]["verdict"] == "Pass"
    assert evaluated_drug["hallucination_check"]["hallucination_detected"] is False

    # 5. Verify Convergence Hardcoded Disclaimer
    assert result["legal_disclaimer"] == LEGAL_DISCLAIMER
    assert result["legal_disclaimer"] == "Prototype Limits: No pediatric dosing"
