import pytest
from unittest.mock import patch
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import app
from router import route_and_evaluate_prescription, LEGAL_DISCLAIMER
from external_llm import evaluate_with_medgemma, verify_with_lynx_8b

client = TestClient(app)

def test_read_only_constraint_dose_never_altered():
    """
    STRICT CONSTRAINT: The AI must NEVER adjust doses.
    It acts purely as a 'Read-Only' flagging engine.
    """
    prescribed_dose = "625 mg PO 1-0-1 After Food x 5 days"
    mock_input = {
        "patient": {"name": "Test", "age": 30, "allergies": []},
        "drugs": [{"name": "Augmentin 625mg", "dose": prescribed_dose, "frequency": "BID"}]
    }

    result = route_and_evaluate_prescription(mock_input)
    assert len(result["drugs"]) == 1
    # Prescribed dose MUST be strictly preserved as written
    assert result["drugs"][0]["prescribed_dose"] == prescribed_dose

def test_audit_trail_presence():
    """
    STRICT CONSTRAINT: Every evaluation MUST enforce an audit_trail containing the exact cited rule.
    """
    mock_input = {
        "patient": {"name": "Test", "age": 17, "allergies": []},
        "drugs": [{"name": "Zenflox 200", "dose": "200 mg PO BID", "frequency": "BID"}]
    }
    result = route_and_evaluate_prescription(mock_input)
    drug = result["drugs"][0]
    assert "audit_trail" in drug
    assert len(drug["audit_trail"]) > 10
    assert "21 CFR 314" in drug["audit_trail"]

def test_never_fabricate_clinical_data_return_500_on_api_failure():
    """
    STRICT CONSTRAINT: Never fabricate clinical data; if an API fails,
    return a 500 error, do not hallucinate a fallback.
    """
    # Trigger slow path by requesting evaluation of an unindexed drug
    payload = {
        "ocrJson": {
            "patient": {"name": "Novel Patient", "age": 50},
            "drugs": [{"name": "NovelDrugX_12345", "dose": "100 mg QD"}]
        }
    }

    # Simulate MedGemma API failure (e.g. 503 or Network Failure)
    with patch("router.evaluate_with_medgemma", side_effect=RuntimeError("External MedGemma API connection timeout")):
        response = client.post("/api/cds/evaluate", json=payload)
        
        # MUST return 500 error per strict constraint!
        assert response.status_code == 500
        data = response.json()
        assert "Clinical CDS Processing Error" in data["detail"]
        assert "MedGemma API connection timeout" in data["detail"]

def test_convergence_legal_disclaimer_always_injected():
    """
    STRICT CONSTRAINT: Force-inject hardcoded legal disclaimer
    ("Prototype Limits: No pediatric dosing") into the final JSON payload.
    """
    mock_input = {
        "patient": {"name": "Test Patient", "age": 28},
        "drugs": [{"name": "Augmentin", "dose": "625 mg BID"}]
    }
    result = route_and_evaluate_prescription(mock_input)
    assert result["legal_disclaimer"] == "Prototype Limits: No pediatric dosing"

    # Also test via FastAPI endpoint
    response = client.post("/api/cds/evaluate", json={"ocrJson": mock_input})
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["legal_disclaimer"] == "Prototype Limits: No pediatric dosing"
