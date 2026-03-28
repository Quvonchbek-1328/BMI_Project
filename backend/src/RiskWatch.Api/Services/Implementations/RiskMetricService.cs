using Microsoft.EntityFrameworkCore;
using RiskWatch.Api.Data;
using RiskWatch.Api.DTOs.RiskMetrics;
using RiskWatch.Api.Entities;
using RiskWatch.Api.Services.Interfaces;

namespace RiskWatch.Api.Services.Implementations;

public class RiskMetricService : IRiskMetricService
{
    private readonly AppDbContext _db;

    public RiskMetricService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<RiskMetricResponse>> GetByProjectAsync(Guid projectId)
    {
        return await _db.RiskMetrics
            .Where(r => r.ProjectId == projectId)
            .OrderByDescending(r => r.RecordedAt)
            .Select(r => MapToResponse(r))
            .ToListAsync();
    }

    public async Task<RiskMetricResponse> GetByIdAsync(Guid id)
    {
        var metric = await _db.RiskMetrics.FindAsync(id)
            ?? throw new KeyNotFoundException("Risk metric not found");
        return MapToResponse(metric);
    }

    public async Task<RiskMetricResponse> CreateAsync(Guid projectId, CreateRiskMetricRequest request)
    {
        _ = await _db.Projects.FindAsync(projectId)
            ?? throw new KeyNotFoundException("Project not found");

        var metric = new RiskMetric
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            TaskId = request.TaskId,
            TaskComplexity = request.TaskComplexity,
            TeamWorkload = request.TeamWorkload,
            RequirementChanges = request.RequirementChanges,
            BugCount = request.BugCount,
            DependencyCount = request.DependencyCount,
            ResourceAvailability = request.ResourceAvailability,
            EstimatedDuration = request.EstimatedDuration,
            ActualDuration = request.ActualDuration,
            SprintVelocity = request.SprintVelocity,
            CommunicationDelay = request.CommunicationDelay,
            PreviousDelayCount = request.PreviousDelayCount,
            TeamExperienceLevel = request.TeamExperienceLevel,
            PriorityLevel = request.PriorityLevel
        };

        await _db.RiskMetrics.AddAsync(metric);
        await _db.SaveChangesAsync();
        return MapToResponse(metric);
    }

    public async Task<List<RiskMetricResponse>> GetHistoryAsync(Guid projectId)
    {
        return await _db.RiskMetrics
            .Where(r => r.ProjectId == projectId)
            .OrderBy(r => r.RecordedAt)
            .Select(r => MapToResponse(r))
            .ToListAsync();
    }

    private static RiskMetricResponse MapToResponse(RiskMetric r) => new()
    {
        Id = r.Id,
        ProjectId = r.ProjectId,
        TaskId = r.TaskId,
        TaskComplexity = r.TaskComplexity,
        TeamWorkload = r.TeamWorkload,
        RequirementChanges = r.RequirementChanges,
        BugCount = r.BugCount,
        DependencyCount = r.DependencyCount,
        ResourceAvailability = r.ResourceAvailability,
        EstimatedDuration = r.EstimatedDuration,
        ActualDuration = r.ActualDuration,
        SprintVelocity = r.SprintVelocity,
        CommunicationDelay = r.CommunicationDelay,
        PreviousDelayCount = r.PreviousDelayCount,
        TeamExperienceLevel = r.TeamExperienceLevel,
        PriorityLevel = r.PriorityLevel,
        RecordedAt = r.RecordedAt,
        CreatedAt = r.CreatedAt
    };
}
