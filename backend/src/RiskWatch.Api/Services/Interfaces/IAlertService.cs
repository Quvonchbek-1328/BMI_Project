using RiskWatch.Api.DTOs.Alerts;
using RiskWatch.Api.DTOs.Common;

namespace RiskWatch.Api.Services.Interfaces;

public interface IAlertService
{
    Task<PaginatedResponse<AlertResponse>> GetUserAlertsAsync(Guid userId, PaginationQuery query);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task MarkAsReadAsync(Guid alertId, Guid userId);
    Task MarkAllAsReadAsync(Guid userId);
    Task CreateAlertAsync(Guid projectId, Guid? taskId, Guid? predictionId, string title, string message, string severity, Guid userId);
}
