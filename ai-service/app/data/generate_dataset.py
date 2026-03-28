"""
Generates a synthetic dataset for training the risk prediction model.
Each row represents a project/task snapshot with 13 risk indicators and a binary delay label.
"""

import numpy as np
import pandas as pd
from pathlib import Path


def generate_dataset(n_samples: int = 5000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.RandomState(seed)

    data = {
        "task_complexity": rng.uniform(0, 10, n_samples),
        "team_workload": rng.uniform(0, 10, n_samples),
        "requirement_changes": rng.randint(0, 30, n_samples),
        "bug_count": rng.randint(0, 100, n_samples),
        "dependency_count": rng.randint(0, 20, n_samples),
        "resource_availability": rng.uniform(0, 1, n_samples),
        "estimated_duration": rng.uniform(5, 180, n_samples),
        "actual_duration": None,  # derived below
        "sprint_velocity": rng.uniform(5, 50, n_samples),
        "communication_delay": rng.uniform(0, 10, n_samples),
        "previous_delay_count": rng.randint(0, 15, n_samples),
        "team_experience_level": rng.uniform(0, 10, n_samples),
        "priority_level": rng.randint(1, 5, n_samples),
    }

    df = pd.DataFrame(data)

    # Compute a "risk score" as a weighted combination
    risk_score = (
        0.15 * df["task_complexity"] / 10
        + 0.15 * df["team_workload"] / 10
        + 0.10 * np.clip(df["requirement_changes"] / 20, 0, 1)
        + 0.08 * np.clip(df["bug_count"] / 50, 0, 1)
        + 0.07 * np.clip(df["dependency_count"] / 15, 0, 1)
        + 0.12 * (1 - df["resource_availability"])
        + 0.05 * np.clip(df["estimated_duration"] / 120, 0, 1)
        + 0.08 * df["communication_delay"] / 10
        + 0.08 * np.clip(df["previous_delay_count"] / 10, 0, 1)
        + 0.07 * (1 - df["team_experience_level"] / 10)
        + 0.05 * (df["priority_level"] - 1) / 3
    )

    # Add noise
    risk_score += rng.normal(0, 0.08, n_samples)
    risk_score = np.clip(risk_score, 0, 1)

    # Generate actual_duration based on estimated + risk-driven overrun
    overrun_factor = 1.0 + risk_score * rng.uniform(0.2, 1.5, n_samples)
    df["actual_duration"] = df["estimated_duration"] * overrun_factor

    # Binary label: delayed if risk_score > threshold (with some noise)
    threshold = 0.45
    delay_prob = 1 / (1 + np.exp(-12 * (risk_score - threshold)))  # sigmoid
    df["is_delayed"] = (rng.random(n_samples) < delay_prob).astype(int)

    # Store continuous risk score for reference
    df["risk_score"] = risk_score

    return df


def save_dataset(output_dir: str = None):
    if output_dir is None:
        output_dir = str(Path(__file__).resolve().parent)

    df = generate_dataset()
    path = Path(output_dir) / "synthetic_risk_data.csv"
    df.to_csv(path, index=False)
    print(f"Dataset saved to {path} ({len(df)} samples)")
    print(f"Delayed: {df['is_delayed'].sum()} ({df['is_delayed'].mean()*100:.1f}%)")
    return path


if __name__ == "__main__":
    save_dataset()
