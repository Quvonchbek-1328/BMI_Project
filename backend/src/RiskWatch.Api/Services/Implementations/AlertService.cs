using Microsoft.EntityFrameworkCore;
using RiskWatch.Api.Data;
using RiskWatch.Api.DTOs.Alerts;
using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.Entities;
using RiskWatch.Api.Services.Interfaces;

namespace RiskWatch.Api.Services.Implementations;

public class AlertService : IAlertService
{
    private readonly AppDbContext _db;

    public AlertService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PaginatedResponse<AlertResponse>> GetUserAlertsAsync(Guid userId, PaginationQuery query)
    {
        var q = _db.Alerts
            .Include(a => a.Project).Include(a => a.Task)
            .Where(a => a.UserId == userId);

        var total = await q.CountAsync();
        var items = await q
            .OrderByDescending(a => a.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(a => MapToResponse(a))
            .ToListAsync();

        return new PaginatedResponse<AlertResponse>
        {
            Items = items, TotalCount = total, Page = query.Page, PageSize = query.PageSize
        };
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _db.Alerts.CountAsync(a => a.UserId == userId && !a.IsRead);
    }

    public async Task MarkAsReadAsync(Guid alertId, Guid userId)
    {
        var alert = await _db.Alerts.FirstOrDefaultAsync(a => a.Id == alertId && a.UserId == userId)
            ?? throw new KeyNotFoundException("Alert not found");
        alert.IsRead = true;
        await _db.SaveChangesAsync();
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        var unread = await _db.Alerts.Where(a => a.UserId == userId && !a.IsRead).ToListAsync();
        foreach (var alert in unread)
            alert.IsRead = true;
        await _db.SaveChangesAsync();
    }

    public async Task CreateAlertAsync(Guid projectId, Guid? taskId, Guid? predictionId,
        string title, string message, string severity, Guid userId)
    {
        var alert = new Alert
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            TaskId = taskId,
            PredictionId = predictionId,
            Title = title,
            Message = message,
            Severity = severity,
            UserId = userId
        };
        await _db.Alerts.AddAsync(alert);
        await _db.SaveChangesAsync();
    }

    private static AlertResponse MapToResponse(Alert a) => new()
    {
        Id = a.Id,
        ProjectId = a.ProjectId,
        ProjectName = a.Project?.Name ?? "",
        TaskId = a.TaskId,
        TaskTitle = a.Task?.Title,
        Title = a.Title,
        Message = a.Message,
        Severity = a.Severity,
        IsRead = a.IsRead,
        CreatedAt = a.CreatedAt
    };
}
