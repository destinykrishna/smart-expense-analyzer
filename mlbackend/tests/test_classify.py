import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_classify_valid_payload():
    payload = {
        "job_id": "test-uuid-123",
        "transactions": [
            {
                "id": "txn_1",
                "date": "2026-04-01",
                "description": "STARBUCKS",
                "amount": -5.99,
                "currency": "USD"
            }
        ]
    }
    headers = {"X-Internal-Key": settings.ML_INTERNAL_SECRET}
    response = client.post("/classify", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert len(data["results"]) == 1
    assert data["results"][0]["txnId"] == "txn_1"

def test_classify_missing_key():
    payload = {
        "job_id": "test-uuid-123",
        "transactions": [
            {
                "id": "txn_1",
                "date": "2026-04-01",
                "description": "STARBUCKS",
                "amount": -5.99,
                "currency": "USD"
            }
        ]
    }
    response = client.post("/classify", json=payload)
    assert response.status_code == 401

def test_classify_invalid_payload():
    payload = {
        "job_id": "test-uuid-123",
        "transactions": [
            {
                "id": "txn_1",
                "date": "2026-04-01"
                # Missing required fields
            }
        ]
    }
    headers = {"X-Internal-Key": settings.ML_INTERNAL_SECRET}
    response = client.post("/classify", json=payload, headers=headers)
    assert response.status_code == 422

def test_classify_empty_transactions():
    payload = {
        "job_id": "test-uuid-123",
        "transactions": []
    }
    headers = {"X-Internal-Key": settings.ML_INTERNAL_SECRET}
    response = client.post("/classify", json=payload, headers=headers)
    assert response.status_code == 422
