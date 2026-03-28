using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.Entities;
using RiskWatch.Api.Services.Implementations;
using RiskWatch.Tests.Helpers;

namespace RiskWatch.Tests.Unit;

public class AlertServiceTests
{
    private (AlertService svc, Guid userId, Guid projectId) Setup()
    {
        var (user, db) = TestDbContextFactory.CreateWithUser();
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = "Alert Test Project",
            Status = ProjectStatus.InProgress,
            StartDate = DateTime.UtcNow,
            OwnerId = user.Id
        };
        db.Projects.Add(project);
        db.SaveChanges();
        return (new AlertService(db), user.Id, project.Id);
    }

    [Fact]
    public async Task CreateAlert_AddsToDatabase()
    {
        var (svc, userId, projectId) = Setup();

        await svc.CreateAlertAsync(projectId, null, null, "Test Alert", "Alert body", AlertSeverity.High, userId);

        var count = await svc.GetUnreadCountAsync(userId);
        Assert.Equal(1, count);
    }

    [Fact]
    public async Task GetUserAlerts_ReturnsPaginated()
    {
        var (svc, userId, projectId) = Setup();

        for (int i = 0; i < 5; i++)
            await svc.CreateAlertAsync(projectId, null, null, $"Alert {i}", "Body", AlertSeverity.Medium, userId);

        var page = await svc.GetUserAlertsAsync(userId, new PaginationQuery { Page = 1, PageSize = 3 });
        Assert.Equal(3, page.Items.Count);
        Assert.Equal(5, page.TotalCount);
    }

    [Fact]
    public async Task MarkAsRead_DecreasesUnreadCount()
    {
        var (svc, userId, projectId) = Setup();
        await svc.CreateAlertAsync(projectId, null, null, "Read Me", "Body", AlertSeverity.Low, userId);

        var alerts = await svc.GetUserAlertsAsync(userId, new PaginationQuery { Page = 1, PageSize = 10 });
        var alertId = alerts.Items[0].Id;

        await svc.MarkAsReadAsync(alertId, userId);

        var unread = await svc.GetUnreadCountAsync(userId);
        Assert.Equal(0, unread);
    }

    [Fact]
    public async Task MarkAsRead_ThrowsForMissingAlert()
    {
        var (svc, userId, _) = Setup();
        await Assert.ThrowsAsync<KeyNotFoundException>(() => svc.MarkAsReadAsync(Guid.NewGuid(), userId));
    }

    [Fact]
    public async Task MarkAllAsRead_ClearsAllUnread()
    {
        var (svc, userId, projectId) = Setup();
        for (int i = 0; i < 3; i++)
            await svc.CreateAlertAsync(projectId, null, null, $"Alert {i}", "Body", AlertSeverity.Medium, userId);

        Assert.Equal(3, await svc.GetUnreadCountAsync(userId));

        await svc.MarkAllAsReadAsync(userId);

        Assert.Equal(0, await svc.GetUnreadCountAsync(userId));
    }

    [Fact]
    public async Task GetUnreadCount_OnlyCountsOwnAlerts()
    {
        var (svc, userId, projectId) = Setup();
        await svc.CreateAlertAsync(projectId, null, null, "My Alert", "Body", AlertSeverity.High, userId);

        var otherUserId = Guid.NewGuid();
        Assert.Equal(0, await svc.GetUnreadCountAsync(otherUserId));
        Assert.Equal(1, await svc.GetUnreadCountAsync(userId));
    }
}
