"""Tests for model loading and prediction logic."""

import pytest
import numpy as np

from app.config import MODEL_PATH, SCALER_PATH
from app.model.predict import load_model, is_model_loaded, predict


@pytest.fixture(autouse=True)
def ensure_model():
    """Ensure model is loaded before tests run."""
    if not MODEL_PATH.exists() or not SCALER_PATH.exists():
        pytest.skip("Model not trained yet. Run train.py first.")
    if not is_model_loaded():
        load_model()


SAMPLE_FEATURES = {
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


def test_model_loaded():
    assert is_model_loaded() is True


def test_predict_returns_required_keys():
    result = predict(SAMPLE_FEATURES)
    assert "delay_probability" in result
    assert "risk_level" in result
    assert "top_factors" in result


def test_predict_probability_range():
    result = predict(SAMPLE_FEATURES)
    assert 0.0 <= result["delay_probability"] <= 1.0


def test_predict_risk_level_values():
    result = predict(SAMPLE_FEATURES)
    assert result["risk_level"] in ("Low", "Medium", "High")


def test_predict_top_factors_count():
    result = predict(SAMPLE_FEATURES)
    assert 1 <= len(result["top_factors"]) <= 5


def test_predict_low_risk_sample():
    low_risk = {
        "task_complexity": 2.0,
        "team_workload": 2.0,
        "requirement_changes": 1,
        "bug_count": 2,
        "dependency_count": 1,
        "resource_availability": 0.95,
        "estimated_duration": 10,
        "actual_duration": 5,
        "sprint_velocity": 40,
        "communication_delay": 0.5,
        "previous_delay_count": 0,
        "team_experience_level": 9.0,
        "priority_level": 1,
    }
    result = predict(low_risk)
    assert result["delay_probability"] < 0.5
