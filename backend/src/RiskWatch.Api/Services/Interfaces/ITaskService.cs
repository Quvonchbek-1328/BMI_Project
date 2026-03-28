using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.DTOs.Tasks;

namespace RiskWatch.Api.Services.Interfaces;

public interface ITaskService
{
    Task<PaginatedResponse<TaskResponse>> GetByProjectAsync(Guid projectId, PaginationQuery query);
    Task<TaskResponse> GetByIdAsync(Guid taskId);
    Task<TaskResponse> CreateAsync(Guid projectId, CreateTaskRequest request);
    Task<TaskResponse> UpdateAsync(Guid taskId, UpdateTaskRequest request);
    Task DeleteAsync(Guid taskId);
    Task<TaskResponse> UpdateStatusAsync(Guid taskId, string status);
    Task<TaskResponse> AssignAsync(Guid taskId, Guid? assigneeId);
}
