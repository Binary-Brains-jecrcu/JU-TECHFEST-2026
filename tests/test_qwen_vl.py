import pytest
import os
import tempfile
import base64
from qwen_vl_service import QwenVLService
from vision_ingest import ingest_prescription_image

def test_qwen_vl_service_synthesizes_paddle_ocr_hints():
    # Test fusing PaddleOCR lines with Qwen multimodal vision reasoning
    paddle_hints = [
        "The White Tusk Dental Clinic",
        "Dr. N. Vance MDS Oral Surgery",
        "Patient: Priya Sharma 32 / Female",
        "1. Tab Augmentin 625 Duo (Amoxicillin + Clav) 1-0-1",
        "2. Tab Chymoral Forte 1-0-1",
        "3. Cap Pantocid DSR 1-0-0"
    ]

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
        # 1x1 transparent PNG byte structure
        f.write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82')
        t_path = f.name

    try:
        result = QwenVLService.extract_with_qwen(t_path, paddle_ocr_lines=paddle_hints)
        assert result is not None
        assert "doctorOrClinic" in result
        assert "patient" in result
        assert "drugs" in result
        assert len(result["drugs"]) >= 2

        drug_names = [d["name"].lower() for d in result["drugs"]]
        assert any("augmentin" in d for d in drug_names)
        assert any("chymoral" in d or "pantocid" in d for d in drug_names)
        assert "reasoning" in result
        assert "Qwen" in result["reasoning"]
    finally:
        if os.path.isfile(t_path):
            os.remove(t_path)

def test_vision_ingest_fuses_paddle_and_qwen():
    # Small valid base64 1x1 PNG
    sample_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    result = ingest_prescription_image(sample_b64)

    assert "patient" in result
    assert "ocrLines" in result
    assert "ocrTokens" in result
    assert "drugs" in result
    assert "qwenReasoning" in result
