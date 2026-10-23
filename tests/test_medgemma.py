import pytest
from medgemma_service import MedGemmaService

def test_medgemma_service_evaluates_rules_and_allergies():
    drug = {
        "name": "Augmentin 625mg",
        "genericName": "Amoxicillin / Clavulanate",
        "dose": "625 mg PO BID"
    }
    patient = {
        "name": "Eleanor Vance",
        "age": 58,
        "allergies": [{"allergen": "Penicillins", "reaction": "Anaphylaxis"}],
        "renalLabs": {"crCl": 25}
    }

    result = MedGemmaService.evaluate_drug_safety(drug, patient)

    assert result["model"] == "google/medgemma-1.5-4b-it"
    assert result["drug_name"] == "Augmentin 625mg"
    assert result["prescribed_dose"] == "625 mg PO BID"
    assert result["read_only_guarantee"] is True

    # 1. Authoritative Medical Rules
    assert len(result["medical_rules"]) >= 2
    assert any("Augmentin" in r or "Amoxicillin" in r or "FDA" in r for r in result["medical_rules"])

    # 2. Allergy & Cross-Reactivity
    assert result["status"] == "contraindicated"
    assert result["allergy_analysis"]["risk_level"] == "CRITICAL CONTRAINDICATION"
    assert "Beta-lactam" in result["allergy_analysis"]["cross_reactivity"]

    # 3. Previous Clinical Test Cases
    assert len(result["clinical_test_cases"]) >= 3
    scenarios = [tc["scenario"] for tc in result["clinical_test_cases"]]
    assert any("Renal" in s for s in scenarios)
    assert any("Demographic" in s or "Age" in s for s in scenarios)

def test_medgemma_service_read_only_dose_immutability():
    original_dose = "10 mg PO Weekly (Sunday)"
    drug = {
        "name": "Folitrax 10mg",
        "genericName": "Methotrexate",
        "dose": original_dose
    }
    patient = {
        "name": "John Doe",
        "age": 45,
        "allergies": [],
        "renalLabs": {"crCl": 85}
    }

    result = MedGemmaService.evaluate_drug_safety(drug, patient)
    assert result["prescribed_dose"] == original_dose
    assert any("ONCE WEEKLY" in r for r in result["medical_rules"])

def test_medgemma_service_handles_string_allergies_and_special_populations():
    # String allergy list & Adolescent age with Zenflox
    drug = {
        "name": "Zenflox-OZ",
        "genericName": "Ofloxacin / Ornidazole",
        "dose": "200mg"
    }
    patient = {
        "name": "Tommy",
        "age": 15,
        "allergies": ["Penicillin", "Sulfa"],
        "crCl": 24
    }

    result = MedGemmaService.evaluate_drug_safety(drug, patient)
    assert result["model"] == "google/medgemma-1.5-4b-it"
    # No penicillin or sulfa cross-reactivity with ofloxacin
    assert result["allergy_analysis"]["status"] == "appropriate"
    # Adolescent warning scenario triggered
    scenarios = [tc["scenario"] for tc in result["clinical_test_cases"]]
    assert any("Adolescent" in s for s in scenarios)
    severities = [tc["severity"] for tc in result["clinical_test_cases"]]
    assert "WARNING" in severities
