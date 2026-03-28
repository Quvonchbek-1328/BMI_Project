"""
Trains a RandomForestClassifier on synthetic project risk data.
Saves the model and scaler to disk.
"""

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report

from app.config import FEATURE_NAMES, MODEL_PATH, SCALER_PATH
from app.data.generate_dataset import generate_dataset


def train_model():
    print("Generating synthetic dataset...")
    df = generate_dataset(n_samples=5000, seed=42)

    X = df[FEATURE_NAMES].values
    y = df["is_delayed"].values

    print(f"Dataset: {len(df)} samples, {y.sum()} delayed ({y.mean()*100:.1f}%)")

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=["On Time", "Delayed"]))

    # Feature importance
    importances = model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    print("\nFeature Importance:")
    for i in sorted_idx:
        print(f"  {FEATURE_NAMES[i]:30s} {importances[i]:.4f}")

    # Save
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    # Save metadata
    metadata = {
        "model_name": "RandomForestClassifier",
        "n_features": len(FEATURE_NAMES),
        "feature_names": FEATURE_NAMES,
        "n_estimators": model.n_estimators,
        "accuracy": round(accuracy, 4),
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
    }
    metadata_path = MODEL_PATH.parent / "model_metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nModel saved to {MODEL_PATH}")
    print(f"Scaler saved to {SCALER_PATH}")
    print(f"Metadata saved to {metadata_path}")

    return model, scaler, accuracy


if __name__ == "__main__":
    train_model()
