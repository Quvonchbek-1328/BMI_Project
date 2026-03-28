using Microsoft.EntityFrameworkCore;
using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.Entities;
using RiskWatch.Api.Services.Implementations;
using RiskWatch.Tests.Helpers;
using Moq;

namespace RiskWatch.Tests.Unit;

public class AdminServiceTests
{
    private AdminService CreateService(out RiskWatch.Api.Data.AppDbContext db)
    {
        db = TestDbContextFactory.Create();
        var mockFactory = new Mock<IHttpClientFactory>();
        mockFactory.Setup(f => f.CreateClient("AiService")).Returns(new HttpClient());
        return new AdminService(db, mockFactory.Object);
    }

    private async Task SeedUsers(RiskWatch.Api.Data.AppDbContext db, int count)
    {
        for (int i = 0; i < count; i++)
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                FullName = $"User {i}",
                Email = $"user{i}@example.com",
                PasswordHash = "hash"
            };
            user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = 2 });
            db.Users.Add(user);
        }
        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task GetUsers_ReturnsPaginatedList()
    {
        var svc = CreateService(out var db);
        await SeedUsers(db, 5);

        var result = await svc.GetUsersAsync(new PaginationQuery { Page = 1, PageSize = 3 });
        Assert.Equal(3, result.Items.Count);
        Assert.Equal(5, result.TotalCount);
    }

    [Fact]
    public async Task GetUsers_IncludesRoles()
    {
        var svc = CreateService(out var db);
        await SeedUsers(db, 1);

        var result = await svc.GetUsersAsync(new PaginationQuery { Page = 1, PageSize = 10 });
        Assert.Contains("ProjectManager", result.Items[0].Roles);
    }

    [Fact]
    public async Task ChangeUserRole_UpdatesRole()
    {
        var svc = CreateService(out var db);
        await SeedUsers(db, 1);
        var user = await db.Users.FirstAsync();

        await svc.ChangeUserRoleAsync(user.Id, "Admin");

        var updated = await db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstAsync(u => u.Id == user.Id);
        Assert.Equal("Admin", updated.UserRoles.First().Role.Name);
    }

    [Fact]
    public async Task ChangeUserRole_ThrowsForInvalidRole()
    {
        var svc = CreateService(out var db);
        await SeedUsers(db, 1);
        var user = await db.Users.FirstAsync();

        await Assert.ThrowsAsync<ArgumentException>(() => svc.ChangeUserRoleAsync(user.Id, "SuperAdmin"));
    }

    [Fact]
    public async Task ChangeUserRole_ThrowsForMissingUser()
    {
        var svc = CreateService(out _);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => svc.ChangeUserRoleAsync(Guid.NewGuid(), "Admin"));
    }

    [Fact]
    public async Task ChangeUserStatus_DeactivatesUser()
    {
        var svc = CreateService(out var db);
        await SeedUsers(db, 1);
        var user = await db.Users.FirstAsync();

        await svc.ChangeUserStatusAsync(user.Id, false);

        var updated = await db.Users.FindAsync(user.Id);
        Assert.False(updated!.IsActive);
    }

    [Fact]
    public async Task GetStats_ReturnsCorrectCounts()
    {
        var svc = CreateService(out var db);
        await SeedUsers(db, 3);

        var user = await db.Users.FirstAsync();
        db.Projects.Add(new Project
        {
            Id = Guid.NewGuid(),
            Name = "P1",
            Status = ProjectStatus.InProgress,
            StartDate = DateTime.UtcNow,
            OwnerId = user.Id
        });
        await db.SaveChangesAsync();

        var stats = await svc.GetStatsAsync();
        Assert.Equal(3, stats.TotalUsers);
        Assert.Equal(1, stats.TotalProjects);
        Assert.Equal(0, stats.TotalTasks);
        Assert.Equal(0, stats.TotalPredictions);
    }
}
