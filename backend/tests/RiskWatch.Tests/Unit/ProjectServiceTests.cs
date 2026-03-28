using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.DTOs.Projects;
using RiskWatch.Api.Services.Implementations;
using RiskWatch.Tests.Helpers;

namespace RiskWatch.Tests.Unit;

public class ProjectServiceTests
{
    private ProjectService CreateService(out RiskWatch.Api.Data.AppDbContext db, out Guid userId)
    {
        var (user, context) = TestDbContextFactory.CreateWithUser();
        db = context;
        userId = user.Id;
        return new ProjectService(db);
    }

    [Fact]
    public async Task Create_ReturnsProjectWithCorrectName()
    {
        var svc = CreateService(out _, out var userId);
        var result = await svc.CreateAsync(new CreateProjectRequest
        {
            Name = "Test Project",
            Description = "A test",
            StartDate = DateTime.UtcNow
        }, userId);

        Assert.Equal("Test Project", result.Name);
        Assert.Equal("NotStarted", result.Status);
    }

    [Fact]
    public async Task GetAll_ReturnsPaginatedList()
    {
        var svc = CreateService(out _, out var userId);
        for (int i = 0; i < 5; i++)
            await svc.CreateAsync(new CreateProjectRequest { Name = $"Proj {i}", StartDate = DateTime.UtcNow }, userId);

        var page = await svc.GetAllAsync(userId, new PaginationQuery { Page = 1, PageSize = 3 });
        Assert.Equal(3, page.Items.Count);
        Assert.Equal(5, page.TotalCount);
        Assert.True(page.HasNext);
    }

    [Fact]
    public async Task GetById_ReturnsProject()
    {
        var svc = CreateService(out _, out var userId);
        var created = await svc.CreateAsync(new CreateProjectRequest { Name = "Find Me", StartDate = DateTime.UtcNow }, userId);

        var found = await svc.GetByIdAsync(created.Id, userId);
        Assert.Equal("Find Me", found.Name);
    }

    [Fact]
    public async Task GetById_ThrowsForMissingProject()
    {
        var svc = CreateService(out _, out var userId);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => svc.GetByIdAsync(Guid.NewGuid(), userId));
    }

    [Fact]
    public async Task Update_ChangesProjectFields()
    {
        var svc = CreateService(out _, out var userId);
        var created = await svc.CreateAsync(new CreateProjectRequest { Name = "Old Name", StartDate = DateTime.UtcNow }, userId);

        var updated = await svc.UpdateAsync(created.Id, new UpdateProjectRequest
        {
            Name = "New Name",
            Status = "InProgress",
            StartDate = DateTime.UtcNow
        }, userId);

        Assert.Equal("New Name", updated.Name);
        Assert.Equal("InProgress", updated.Status);
    }

    [Fact]
    public async Task Delete_RemovesProject()
    {
        var svc = CreateService(out _, out var userId);
        var created = await svc.CreateAsync(new CreateProjectRequest { Name = "Delete Me", StartDate = DateTime.UtcNow }, userId);

        await svc.DeleteAsync(created.Id, userId);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => svc.GetByIdAsync(created.Id, userId));
    }

    [Fact]
    public async Task GetSummary_ReturnsCorrectCounts()
    {
        var svc = CreateService(out var db, out var userId);
        var project = await svc.CreateAsync(new CreateProjectRequest { Name = "Summary Proj", StartDate = DateTime.UtcNow }, userId);

        // Add tasks
        db.ProjectTasks.AddRange(
            new Api.Entities.ProjectTask { Id = Guid.NewGuid(), ProjectId = project.Id, Title = "T1", Status = "Done", Priority = "Medium" },
            new Api.Entities.ProjectTask { Id = Guid.NewGuid(), ProjectId = project.Id, Title = "T2", Status = "InProgress", Priority = "High" }
        );
        await db.SaveChangesAsync();

        var summary = await svc.GetSummaryAsync(project.Id, userId);
        Assert.Equal(2, summary.TotalTasks);
        Assert.Equal(1, summary.CompletedTasks);
        Assert.Equal(50.0, summary.ProgressPercent);
    }
}
