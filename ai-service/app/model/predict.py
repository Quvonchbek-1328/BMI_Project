"""
Loads the trained model and scaler, runs predictions on new data.
"""

import numpy as np
import joblib

from app.config import MODEL_PATH, SCALER_PATH, FEATURE_NAMES, FEATURE_DISPLAY_NAMES


_model = None
_scaler = None


def load_model():
    """Load model and scaler from disk. Called once at startup."""
    global _model, _scaler
    _model = joblib.load(MODEL_PATH)
    _scaler = joblib.load(SCALER_PATH)


def is_model_loaded() -> bool:
    return _model is not None and _scaler is not None


def predict(features: dict) -> dict:
    """
    Run prediction on a single sample.

    Args:
        features: dict with keys matching FEATURE_NAMES

    Returns:
        dict with delay_probability, risk_level, top_factors
    """
    if not is_model_loaded():
        raise RuntimeError("Model not loaded. Call load_model() first.")

    # Build feature vector in correct order
    X = np.array([[features[name] for name in FEATURE_NAMES]])

    # Scale
    X_scaled = _scaler.transform(X)

    # Predict probability
    proba = _model.predict_proba(X_scaled)[0]
    delay_prob = float(proba[1])  # probability of class 1 (delayed)

    # Risk level
    if delay_prob >= 0.7:
        risk_level = "High"
    elif delay_prob >= 0.4:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Top contributing factors via feature importances
    importances = _model.feature_importances_
    feature_values = X[0]

    # Weight importances by normalized feature value magnitude
    weighted = importances * np.abs(feature_values) / (np.max(np.abs(feature_values)) + 1e-9)
    sorted_idx = np.argsort(weighted)[::-1]

    top_factors = []
    for idx in sorted_idx[:5]:
        name = FEATURE_NAMES[idx]
        display = FEATURE_DISPLAY_NAMES.get(name, name)
        top_factors.append(display)

    return {
        "delay_probability": round(delay_prob, 4),
        "risk_level": risk_level,
        "top_factors": top_factors,
    }
