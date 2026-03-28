"""
FastAPI application — AI prediction service for RiskWatch.
"""

import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import MODEL_PATH, SCALER_PATH, FEATURE_NAMES, CORS_ORIGINS
from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    HealthResponse,
    ModelInfoResponse,
)
from app.model.predict import load_model, is_model_loaded, predict
from app.model.recommendations import generate_recommendations


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup."""
    if MODEL_PATH.exists() and SCALER_PATH.exists():
        load_model()
        print(f"Model loaded from {MODEL_PATH}")
    else:
        print("WARNING: Model files not found. Train the model first.")
    yield


app = FastAPI(
    title="RiskWatch AI Service",
    description="ML prediction service for project schedule delay risk",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/predict", response_model=PredictionResponse)
async def run_prediction(request: PredictionRequest):
    """Run delay risk prediction on the provided metrics."""
    if not is_model_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded. Train the model first.")

    features = request.model_dump()

    # Run ML prediction
    result = predict(features)

    # Generate recommendations
    recommendations = generate_recommendations(features, result["risk_level"])

    return PredictionResponse(
        delay_probability=result["delay_probability"],
        risk_level=result["risk_level"],
        top_factors=result["top_factors"],
        recommendations=recommendations,
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        model_loaded=is_model_loaded(),
        version="1.0.0",
    )


@app.get("/model-info", response_model=ModelInfoResponse)
async def model_info():
    """Return model metadata."""
    metadata_path = MODEL_PATH.parent / "model_metadata.json"
    if not metadata_path.exists():
        raise HTTPException(status_code=404, detail="Model metadata not found. Train the model first.")

    with open(metadata_path) as f:
        meta = json.load(f)

    return ModelInfoResponse(
        model_name=meta["model_name"],
        n_features=meta["n_features"],
        feature_names=meta["feature_names"],
        trained_at=meta["trained_at"],
        accuracy=meta["accuracy"],
        n_estimators=meta["n_estimators"],
    )
