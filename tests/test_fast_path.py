import pytest
from unittest.mock import patch
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from router import route_and_evaluate_prescription, LEGAL_DISCLAIMER
from database import query_golden_drug

def test_fast_path_bypasses_medgemma():
    """
    CRITICAL TEST: Verifies that when a drug exists in the local SQLite GoldenDataset,
    the Query Router directs the request to the Fast Path and MEDGEMMA API IS NEVER CALLED.
    """
    mock_ocr_input = {
        "patient": {
            "name": "Shaik Rehan",
            "age": 17,
            "gender": "Male",
            "renalLabs": {"crCl": 110},
            "allergies": []
        },
        "drugs": [
            {
                "name": "Zenflox 200",
                "genericName": "Ofloxacin",
                "dose": "200 mg PO 1-0-1 After Food x 5 days",
                "route": "PO",
                "frequency": "BID"
            }
        ],
        "ocrLines": ["Zenflox 200 mg 1-0-1 x 5 days"]
    }

    # Patch evaluate_with_medgemma to fail if ever called
    with patch("router.evaluate_with_medgemma") as mock_medgemma:
        with patch("router.verify_with_lynx_8b") as mock_lynx:
            result = route_and_evaluate_prescription(mock_ocr_input)

            # Assert MedGemma and Lynx were completely BYPASSED
            mock_medgemma.assert_not_called()
            mock_lynx.assert_not_called()

    # Verify Fast Path Execution
    assert "Fast Path" in result["route_taken"]
    assert len(result["drugs"]) == 1

    drug_res = result["drugs"][0]
    assert drug_res["drug_name"] == "Zenflox 200 (Ofloxacin 200mg)"
    assert drug_res["execution_path"] == "Fast Path (Local SQLite GoldenDataset)"
    assert drug_res["label"] == "Adolescent Quinolone Precaution"
    assert "21 CFR 314" in drug_res["audit_trail"]

    # Verify Read-Only Constraint: Dose was NOT adjusted
    assert drug_res["prescribed_dose"] == "200 mg PO 1-0-1 After Food x 5 days"

    # Verify Convergence Constraint: Hardcoded disclaimer is injected
    assert result["legal_disclaimer"] == LEGAL_DISCLAIMER
    assert result["legal_disclaimer"] == "Prototype Limits: No pediatric dosing"

def test_fast_path_warfarin_fluconazole_ddi():
    """
    Verifies that Fast Path computes DDI flags deterministically without any LLM.
    """
    mock_ocr_input = {
        "patient": {
            "name": "Eleanor Vance",
            "age": 71,
            "gender": "Female",
            "renalLabs": {"crCl": 32},
            "allergies": []
        },
        "drugs": [
            {
                "name": "Warfarin Sodium",
                "dose": "5 mg PO QD Bedtime",
                "route": "PO",
                "frequency": "QD"
            },
            {
                "name": "Fluconazole",
                "dose": "200 mg PO QD",
                "route": "PO",
                "frequency": "QD"
            }
        ]
    }

    with patch("router.evaluate_with_medgemma") as mock_medgemma:
        result = route_and_evaluate_prescription(mock_ocr_input)
        mock_medgemma.assert_not_called()

    assert "Fast Path" in result["route_taken"]
    warfarin = next(d for d in result["drugs"] if "Warfarin" in d["drug_name"])
    assert "DDI Alert" in warfarin["explanation"]
    assert "CYP2C9" in warfarin["audit_trail"]
    assert warfarin["prescribed_dose"] == "5 mg PO QD Bedtime"
