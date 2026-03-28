"""Tests for Pydantic schema validation."""

import pytest
from pydantic import ValidationError

from app.schemas.prediction import PredictionRequest


VALID_INPUT = {
    "task_complexity": 5.0,
    "team_workload": 6.0,
    "requirement_changes": 3,
    "bug_count": 10,
    "dependency_count": 4,
    "resource_availability": 0.7,
    "estimated_duration": 30,
    "actual_duration": 20,
    "sprint_velocity": 22,
    "communication_delay": 2.0,
    "previous_delay_count": 1,
    "team_experience_level": 7.0,
    "priority_level": 2,
}


def test_valid_request():
    req = PredictionRequest(**VALID_INPUT)
    assert req.task_complexity == 5.0
    assert req.priority_level == 2


def test_missing_field():
    data = {**VALID_INPUT}
    del data["task_complexity"]
    with pytest.raises(ValidationError):
        PredictionRequest(**data)


def test_task_complexity_out_of_range():
    data = {**VALID_INPUT, "task_complexity": 15}
    with pytest.raises(ValidationError):
        PredictionRequest(**data)


def test_resource_availability_out_of_range():
    data = {**VALID_INPUT, "resource_availability": 1.5}
    with pytest.raises(ValidationError):
        PredictionRequest(**data)


def test_priority_level_out_of_range():
    data = {**VALID_INPUT, "priority_level": 0}
    with pytest.raises(ValidationError):
        PredictionRequest(**data)


def test_negative_bug_count():
    data = {**VALID_INPUT, "bug_count": -1}
    with pytest.raises(ValidationError):
        PredictionRequest(**data)


def test_estimated_duration_zero():
    data = {**VALID_INPUT, "estimated_duration": 0}
    with pytest.raises(ValidationError):
        PredictionRequest(**data)
