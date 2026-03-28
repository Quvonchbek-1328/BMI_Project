using Microsoft.EntityFrameworkCore;
using RiskWatch.Api.Data;
using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.DTOs.Tasks;
using RiskWatch.Api.Entities;
using RiskWatch.Api.Services.Interfaces;

namespace RiskWatch.Api.Services.Implementations;

public class TaskService : ITaskService
{
    private readonly AppDbContext _db;

    public TaskService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PaginatedResponse<TaskResponse>> GetByProjectAsync(Guid projectId, PaginationQuery query)
    {
        var q = _db.ProjectTasks
            .Include(t => t.Project).Include(t => t.Assignee)
            .Where(t => t.ProjectId == projectId);

        var total = await q.CountAsync();
        var items = await q
            .OrderByDescending(t => t.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(t => MapToResponse(t))
            .ToListAsync();

        return new PaginatedResponse<TaskResponse>
        {
            Items = items, TotalCount = total, Page = query.Page, PageSize = query.PageSize
        };
    }

    public async Task<TaskResponse> GetByIdAsync(Guid taskId)
    {
        var task = await _db.ProjectTasks
            .Include(t => t.Project).Include(t => t.Assignee).Include(t => t.Predictions)
            .FirstOrDefaultAsync(t => t.Id == taskId)
            ?? throw new KeyNotFoundException("Task not found");
        return MapToResponse(task);
    }

    public async Task<TaskResponse> CreateAsync(Guid projectId, CreateTaskRequest request)
    {
        var project = await _db.Projects.FindAsync(projectId)
            ?? throw new KeyNotFoundException("Project not found");

        var task = new ProjectTask
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            AssigneeId = request.AssigneeId,
            EstimatedHours = request.EstimatedHours,
            Deadline = request.Deadline,
            Complexity = request.Complexity,
            Status = TaskItemStatus.Todo
        };

        await _db.ProjectTasks.AddAsync(task);
        await _db.SaveChangesAsync();
        return await GetByIdAsync(task.Id);
    }

    public async Task<TaskResponse> UpdateAsync(Guid taskId, UpdateTaskRequest request)
    {
        var task = await _db.ProjectTasks.FindAsync(taskId)
            ?? throw new KeyNotFoundException("Task not found");

        task.Title = request.Title;
        task.Description = request.Description;
        task.Status = request.Status;
        task.Priority = request.Priority;
        task.AssigneeId = request.AssigneeId;
        task.EstimatedHours = request.EstimatedHours;
        task.ActualHours = request.ActualHours;
        task.Deadline = request.Deadline;
        task.Complexity = request.Complexity;
        task.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(taskId);
    }

    public async Task DeleteAsync(Guid taskId)
    {
        var task = await _db.ProjectTasks.FindAsync(taskId)
            ?? throw new KeyNotFoundException("Task not found");
        _db.ProjectTasks.Remove(task);
        await _db.SaveChangesAsync();
    }

    public async Task<TaskResponse> UpdateStatusAsync(Guid taskId, string status)
    {
        var task = await _db.ProjectTasks.FindAsync(taskId)
            ?? throw new KeyNotFoundException("Task not found");
        task.Status = status;
        task.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return await GetByIdAsync(taskId);
    }

    public async Task<TaskResponse> AssignAsync(Guid taskId, Guid? assigneeId)
    {
        var task = await _db.ProjectTasks.FindAsync(taskId)
            ?? throw new KeyNotFoundException("Task not found");
        task.AssigneeId = assigneeId;
        task.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return await GetByIdAsync(taskId);
    }

    private static TaskResponse MapToResponse(ProjectTask t)
    {
        var latestPred = t.Predictions?.OrderByDescending(p => p.CreatedAt).FirstOrDefault();
        return new TaskResponse
        {
            Id = t.Id,
            ProjectId = t.ProjectId,
            ProjectName = t.Project?.Name ?? "",
            Title = t.Title,
            Description = t.Description,
            Status = t.Status,
            Priority = t.Priority,
            AssigneeId = t.AssigneeId,
            AssigneeName = t.Assignee?.FullName,
            EstimatedHours = t.EstimatedHours,
            ActualHours = t.ActualHours,
            Deadline = t.Deadline,
            Complexity = t.Complexity,
            LatestDelayProbability = latestPred?.DelayProbability,
            LatestRiskLevel = latestPred?.RiskLevel,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt
        };
    }
}
