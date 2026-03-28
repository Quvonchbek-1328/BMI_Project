"""Tests for the FastAPI /predict endpoint."""

import pytest
from fastapi.testclient import TestClient

from app.config import MODEL_PATH, SCALER_PATH
from app.main import app


@pytest.fixture
def client():
    if not MODEL_PATH.exists() or not SCALER_PATH.exists():
        pytest.skip("Model not trained yet. Run train.py first.")
    return TestClient(app)


VALID_PAYLOAD = {
    "task_complexity": 7.5,
    "team_workload": 8.0,
    "requirement_changes": 12,
    "bug_count": 25,
    "dependency_count": 8,
    "resource_availability": 0.4,
    "estimated_duration": 60,
    "actual_duration": 45,
    "sprint_velocity": 15,
    "communication_delay": 6.0,
    "previous_delay_count": 3,
    "team_experience_level": 4.0,
    "priority_level": 3,
}


def test_predict_success(client):
    resp = client.post("/predict", json=VALID_PAYLOAD)
    assert resp.status_code == 200
    data = resp.json()
    assert "delay_probability" in data
    assert "risk_level" in data
    assert "top_factors" in data
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)


def test_predict_invalid_payload(client):
    resp = client.post("/predict", json={"task_complexity": 5})
    assert resp.status_code == 422


def test_predict_out_of_range(client):
    bad = {**VALID_PAYLOAD, "task_complexity": 20}
    resp = client.post("/predict", json=bad)
    assert resp.status_code == 422


def test_health_endpoint(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True


def test_model_info_endpoint(client):
    resp = client.get("/model-info")
    assert resp.status_code == 200
    data = resp.json()
    assert data["model_name"] == "RandomForestClassifier"
    assert data["n_features"] == 13
