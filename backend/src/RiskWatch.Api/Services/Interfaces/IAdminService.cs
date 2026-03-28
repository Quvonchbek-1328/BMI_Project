using RiskWatch.Api.DTOs.Admin;
using RiskWatch.Api.DTOs.Common;

namespace RiskWatch.Api.Services.Interfaces;

public interface IAdminService
{
    Task<PaginatedResponse<UserListResponse>> GetUsersAsync(PaginationQuery query);
    Task ChangeUserRoleAsync(Guid userId, string role);
    Task ChangeUserStatusAsync(Guid userId, bool isActive);
    Task<SystemStatsResponse> GetStatsAsync();
    Task<object?> GetModelInfoAsync();
}
