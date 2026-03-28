import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "saved_models" / "risk_model.joblib"
SCALER_PATH = BASE_DIR / "saved_models" / "scaler.joblib"

FEATURE_NAMES = [
    "task_complexity",
    "team_workload",
    "requirement_changes",
    "bug_count",
    "dependency_count",
    "resource_availability",
    "estimated_duration",
    "actual_duration",
    "sprint_velocity",
    "communication_delay",
    "previous_delay_count",
    "team_experience_level",
    "priority_level",
]

FEATURE_DISPLAY_NAMES = {
    "task_complexity": "High task complexity",
    "team_workload": "High team workload",
    "requirement_changes": "Frequent requirement changes",
    "bug_count": "High bug count",
    "dependency_count": "High dependency count",
    "resource_availability": "Low resource availability",
    "estimated_duration": "Long estimated duration",
    "actual_duration": "Duration overrun",
    "sprint_velocity": "Low sprint velocity",
    "communication_delay": "Communication delays",
    "previous_delay_count": "History of delays",
    "team_experience_level": "Low team experience",
    "priority_level": "High priority pressure",
}

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5000,http://localhost:5173").split(",")
