using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.DTOs.Predictions;

namespace RiskWatch.Api.Services.Interfaces;

public interface IPredictionService
{
    Task<PredictionResponse> RunPredictionAsync(RunPredictionRequest request, Guid userId);
    Task<List<PredictionResponse>> GetByProjectAsync(Guid projectId);
    Task<PredictionResponse> GetByIdAsync(Guid id);
    Task<List<PredictionResponse>> GetLatestAsync(Guid userId);
}
