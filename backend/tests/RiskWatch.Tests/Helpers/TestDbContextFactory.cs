using Microsoft.EntityFrameworkCore;
using RiskWatch.Api.Data;
using RiskWatch.Api.Entities;

namespace RiskWatch.Tests.Helpers;

/// <summary>
/// Creates an InMemory AppDbContext for unit testing, pre-seeded with roles.
/// </summary>
public static class TestDbContextFactory
{
    public static AppDbContext Create(string? dbName = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: dbName ?? Guid.NewGuid().ToString())
            .Options;

        var db = new AppDbContext(options);
        db.Database.EnsureCreated();

        // Seed roles if not already present
        if (!db.Roles.Any())
        {
            db.Roles.AddRange(
                new Role { Id = 1, Name = "Admin" },
                new Role { Id = 2, Name = "ProjectManager" },
                new Role { Id = 3, Name = "TeamMember" }
            );
            db.SaveChanges();
        }

        return db;
    }

    /// <summary>Creates a user and returns (user, db).</summary>
    public static (User user, AppDbContext db) CreateWithUser(string? dbName = null)
    {
        var db = Create(dbName);
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test User",
            Email = "test@example.com",
            PasswordHash = Api.Helpers.PasswordHasher.Hash("Password123!")
        };
        user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = 2 }); // ProjectManager
        db.Users.Add(user);
        db.SaveChanges();
        return (user, db);
    }
}
