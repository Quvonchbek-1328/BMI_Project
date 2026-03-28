using Microsoft.EntityFrameworkCore;
using RiskWatch.Api.Data;
using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.DTOs.Projects;
using RiskWatch.Api.Entities;
using RiskWatch.Api.Services.Interfaces;

namespace RiskWatch.Api.Services.Implementations;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _db;

    public ProjectService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PaginatedResponse<ProjectResponse>> GetAllAsync(Guid userId, PaginationQuery query)
    {
        var q = _db.Projects.Include(p => p.Owner).Include(p => p.Tasks).AsQueryable();

        var total = await q.CountAsync();
        var items = await q
            .OrderByDescending(p => p.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(p => MapToResponse(p))
            .ToListAsync();

        return new PaginatedResponse<ProjectResponse>
        {
            Items = items,
            TotalCount = total,
            Page = query.Page,
            PageSize = query.PageSize
        };
    }

    public async Task<ProjectResponse> GetByIdAsync(Guid projectId, Guid userId)
    {
        var project = await _db.Projects
            .Include(p => p.Owner).Include(p => p.Tasks).Include(p => p.Predictions)
            .FirstOrDefaultAsync(p => p.Id == projectId)
            ?? throw new KeyNotFoundException("Project not found");

        return MapToResponse(project);
    }

    public async Task<ProjectResponse> CreateAsync(CreateProjectRequest request, Guid ownerId)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Status = ProjectStatus.NotStarted,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Budget = request.Budget,
            OwnerId = ownerId
        };

        await _db.Projects.AddAsync(project);
        await _db.SaveChangesAsync();

        return await GetByIdAsync(project.Id, ownerId);
    }

    public async Task<ProjectResponse> UpdateAsync(Guid projectId, UpdateProjectRequest request, Guid userId)
    {
        var project = await _db.Projects.FindAsync(projectId)
            ?? throw new KeyNotFoundException("Project not found");

        project.Name = request.Name;
        project.Description = request.Description;
        project.Status = request.Status;
        project.StartDate = request.StartDate;
        project.EndDate = request.EndDate;
        project.Budget = request.Budget;
        project.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(projectId, userId);
    }

    public async Task DeleteAsync(Guid projectId, Guid userId)
    {
        var project = await _db.Projects.FindAsync(projectId)
            ?? throw new KeyNotFoundException("Project not found");

        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();
    }

    public async Task<ProjectSummaryResponse> GetSummaryAsync(Guid projectId, Guid userId)
    {
        var project = await _db.Projects
            .Include(p => p.Tasks)
            .Include(p => p.Predictions)
            .Include(p => p.Alerts)
            .FirstOrDefaultAsync(p => p.Id == projectId)
            ?? throw new KeyNotFoundException("Project not found");

        var totalTasks = project.Tasks.Count;
        var completedTasks = project.Tasks.Count(t => t.Status == TaskItemStatus.Done);
        var latestPrediction = project.Predictions.OrderByDescending(p => p.CreatedAt).FirstOrDefault();

        return new ProjectSummaryResponse
        {
            ProjectId = project.Id,
            ProjectName = project.Name,
            TotalTasks = totalTasks,
            CompletedTasks = completedTasks,
            HighRiskTasks = project.Tasks.Count(t => t.Predictions.Any(p => p.RiskLevel == "High")),
            ProgressPercent = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 1) : 0,
            AverageDelayProbability = project.Predictions.Any() ? project.Predictions.Average(p => p.DelayProbability) : null,
            OverallRiskLevel = latestPrediction?.RiskLevel ?? "Low",
            AlertCount = project.Alerts.Count(a => !a.IsRead)
        };
    }

    private static ProjectResponse MapToResponse(Project p)
    {
        var latestPrediction = p.Predictions?.OrderByDescending(pr => pr.CreatedAt).FirstOrDefault();
        return new ProjectResponse
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Status = p.Status,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            Budget = p.Budget,
            OwnerName = p.Owner?.FullName ?? "",
            OwnerId = p.OwnerId,
            TaskCount = p.Tasks?.Count ?? 0,
            CompletedTaskCount = p.Tasks?.Count(t => t.Status == TaskItemStatus.Done) ?? 0,
            LatestDelayProbability = latestPrediction?.DelayProbability,
            LatestRiskLevel = latestPrediction?.RiskLevel,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }
}
