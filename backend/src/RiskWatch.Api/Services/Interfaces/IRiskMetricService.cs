using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.DTOs.RiskMetrics;

namespace RiskWatch.Api.Services.Interfaces;

public interface IRiskMetricService
{
    Task<List<RiskMetricResponse>> GetByProjectAsync(Guid projectId);
    Task<RiskMetricResponse> GetByIdAsync(Guid id);
    Task<RiskMetricResponse> CreateAsync(Guid projectId, CreateRiskMetricRequest request);
    Task<List<RiskMetricResponse>> GetHistoryAsync(Guid projectId);
}
