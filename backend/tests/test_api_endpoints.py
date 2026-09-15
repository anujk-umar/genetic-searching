from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_demo_dpyd_endpoint():
    response = client.get("/api/demo-dpyd")
    assert response.status_code == 200
    data = response.json()
    assert data["resource_type"] == "DiagnosticReport"
    assert data["patient_id"] == "PATIENT_DEMO_DPYD"
    assert len(data["assessments"]) >= 5
    
    # Verify DPYD assessment is present
    dpyd = next(a for a in data["assessments"] if "Fluorouracil" in a["drug"])
    assert dpyd["activity_score"] == 1.0
    assert dpyd["phenotype"] == "Intermediate Metabolizer"
    assert dpyd["llm_generated_explanation"] is not None
    assert "[AI Clinical Explanation" in dpyd["llm_generated_explanation"]


def test_analyze_raw_endpoint():
    sample_vcf = (
        "##fileformat=VCFv4.2\n"
        "#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tTEST_PATIENT\n"
        "chr1\t97544241\trs3918290\tC\tT\t99\tPASS\tGENE=DPYD;RS=rs3918290;STAR=*2A;FUNCTION=no_function\tGT:DP:GQ\t0|1:45:99\n"
    )
    response = client.post("/api/analyze-raw", json={
        "vcf_content": sample_vcf,
        "patient_id": "TEST_PATIENT",
        "file_name": "test_input.vcf"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["patient_id"] == "TEST_PATIENT"
    assert data["total_drugs_evaluated"] >= 5
