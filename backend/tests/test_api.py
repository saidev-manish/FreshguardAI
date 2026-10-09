import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "sqlite"

def test_dashboard_summary():
    response = client.get("/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "high_risk_count" in data
    assert "projected_waste_cost" in data

def test_products_list():
    response = client.get("/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0
    assert "sku" in products[0]

def test_product_risk_existing():
    response = client.get("/products/PROD-MLK-001/risk")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "PROD-MLK-001"
    assert len(data["cohorts"]) > 0

def test_product_risk_not_found():
    response = client.get("/products/NON-EXISTENT/risk")
    assert response.status_code == 404

def test_recommendations_list():
    response = client.get("/recommendations")
    assert response.status_code == 200
    recs = response.json()
    assert len(recs) > 0

def test_review_recommendation_and_audit():
    # Review an existing recommendation
    payload = {
        "decision": "APPROVED",
        "reviewer_id": "Store Manager Alex",
        "reviewer_note": "Approved via automated test"
    }
    response = client.patch("/recommendations/REC-2026-102/review", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "APPROVED"
    assert "review_id" in data

    # Verify audit event was logged
    audit_res = client.get("/audit")
    assert audit_res.status_code == 200
    audit_logs = audit_res.json()
    assert len(audit_logs) > 0

def test_evaluation_run():
    # Test all 6 documented judging scenarios
    for i in range(1, 7):
        scenario_id = f"SCENARIO-0{i}"
        payload = {"scenario_id": scenario_id}
        response = client.post("/evaluation/run", json=payload)
        assert response.status_code == 200, f"Scenario {scenario_id} evaluation failed"
        data = response.json()
        assert data["id"] == scenario_id
        assert "baseline" in data
        assert "freshguard" in data
        assert "observed_inputs" in data
        assert data["projected_net_benefit"] > 0

def test_evaluation_run_invalid_scenario():
    payload = {"scenario_id": "SCENARIO-INVALID-99"}
    response = client.post("/evaluation/run", json=payload)
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data

