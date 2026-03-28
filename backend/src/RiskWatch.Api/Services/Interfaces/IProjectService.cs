using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.DTOs.Projects;

namespace RiskWatch.Api.Services.Interfaces;

public interface IProjectService
{
    Task<PaginatedResponse<ProjectResponse>> GetAllAsync(Guid userId, PaginationQuery query);
    Task<ProjectResponse> GetByIdAsync(Guid projectId, Guid userId);
    Task<ProjectResponse> CreateAsync(CreateProjectRequest request, Guid ownerId);
    Task<ProjectResponse> UpdateAsync(Guid projectId, UpdateProjectRequest request, Guid userId);
    Task DeleteAsync(Guid projectId, Guid userId);
    Task<ProjectSummaryResponse> GetSummaryAsync(Guid projectId, Guid userId);
}
