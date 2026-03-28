from pydantic import BaseModel, Field
from typing import List


class PredictionRequest(BaseModel):
    task_complexity: float = Field(..., ge=0, le=10, description="0-10 scale")
    team_workload: float = Field(..., ge=0, le=10)
    requirement_changes: int = Field(..., ge=0)
    bug_count: int = Field(..., ge=0)
    dependency_count: int = Field(..., ge=0)
    resource_availability: float = Field(..., ge=0, le=1, description="0-1 ratio")
    estimated_duration: float = Field(..., gt=0, description="days")
    actual_duration: float = Field(..., ge=0, description="days")
    sprint_velocity: float = Field(..., ge=0)
    communication_delay: float = Field(..., ge=0, le=10)
    previous_delay_count: int = Field(..., ge=0)
    team_experience_level: float = Field(..., ge=0, le=10)
    priority_level: int = Field(..., ge=1, le=4)

    model_config = {"json_schema_extra": {
        "examples": [{
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
        }]
    }}


class PredictionResponse(BaseModel):
    delay_probability: float = Field(..., ge=0, le=1)
    risk_level: str = Field(..., description="Low / Medium / High")
    top_factors: List[str]
    recommendations: List[str]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str


class ModelInfoResponse(BaseModel):
    model_name: str
    n_features: int
    feature_names: List[str]
    trained_at: str
    accuracy: float
    n_estimators: int
