using Microsoft.Extensions.Configuration;
using RiskWatch.Api.DTOs.Auth;
using RiskWatch.Api.Helpers;
using RiskWatch.Api.Services.Implementations;
using RiskWatch.Tests.Helpers;

namespace RiskWatch.Tests.Unit;

public class AuthServiceTests
{
    private readonly IConfiguration _config;

    public AuthServiceTests()
    {
        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "SuperSecretTestKeyThatIsAtLeast32CharsLong!!!",
                ["Jwt:Issuer"] = "TestIssuer",
                ["Jwt:Audience"] = "TestAudience",
                ["Jwt:ExpiresInHours"] = "2",
            })
            .Build();
    }

    private AuthService CreateService(out RiskWatch.Api.Data.AppDbContext db)
    {
        db = TestDbContextFactory.Create();
        return new AuthService(db, new JwtHelper(_config));
    }

    [Fact]
    public async Task Register_CreatesUserAndReturnsToken()
    {
        var svc = CreateService(out var db);
        var result = await svc.RegisterAsync(new RegisterRequest
        {
            FullName = "Alice",
            Email = "alice@example.com",
            Password = "SecurePass1!"
        });

        Assert.NotNull(result);
        Assert.NotEmpty(result.Token);
        Assert.Equal("alice@example.com", result.Email);
        Assert.Contains("ProjectManager", result.Roles);
    }

    [Fact]
    public async Task Register_ThrowsOnDuplicateEmail()
    {
        var svc = CreateService(out _);
        await svc.RegisterAsync(new RegisterRequest
        {
            FullName = "User1",
            Email = "dup@example.com",
            Password = "Pass123!"
        });

        await Assert.ThrowsAsync<ArgumentException>(() =>
            svc.RegisterAsync(new RegisterRequest
            {
                FullName = "User2",
                Email = "dup@example.com",
                Password = "Pass456!"
            })
        );
    }

    [Fact]
    public async Task Login_ReturnsTokenForValidCredentials()
    {
        var svc = CreateService(out _);
        await svc.RegisterAsync(new RegisterRequest
        {
            FullName = "Bob",
            Email = "bob@example.com",
            Password = "BobPass1!"
        });

        var result = await svc.LoginAsync(new LoginRequest
        {
            Email = "bob@example.com",
            Password = "BobPass1!"
        });

        Assert.NotEmpty(result.Token);
        Assert.Equal("Bob", result.FullName);
    }

    [Fact]
    public async Task Login_ThrowsOnWrongPassword()
    {
        var svc = CreateService(out _);
        await svc.RegisterAsync(new RegisterRequest
        {
            FullName = "Carol",
            Email = "carol@example.com",
            Password = "Right1!"
        });

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            svc.LoginAsync(new LoginRequest
            {
                Email = "carol@example.com",
                Password = "Wrong1!"
            })
        );
    }

    [Fact]
    public async Task Login_ThrowsOnInactivatedUser()
    {
        var svc = CreateService(out var db);
        await svc.RegisterAsync(new RegisterRequest
        {
            FullName = "Dave",
            Email = "dave@example.com",
            Password = "Dave1!"
        });

        var user = db.Users.First(u => u.Email == "dave@example.com");
        user.IsActive = false;
        await db.SaveChangesAsync();

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            svc.LoginAsync(new LoginRequest { Email = "dave@example.com", Password = "Dave1!" })
        );
    }

    [Fact]
    public async Task GetProfile_ReturnsCorrectData()
    {
        var svc = CreateService(out _);
        var reg = await svc.RegisterAsync(new RegisterRequest
        {
            FullName = "Eve",
            Email = "eve@example.com",
            Password = "Eve123!"
        });

        var profile = await svc.GetProfileAsync(reg.UserId);
        Assert.Equal("Eve", profile.FullName);
        Assert.Equal("eve@example.com", profile.Email);
    }

    [Fact]
    public async Task UpdateProfile_ChangesName()
    {
        var svc = CreateService(out _);
        var reg = await svc.RegisterAsync(new RegisterRequest
        {
            FullName = "OldName",
            Email = "update@example.com",
            Password = "Pass1!"
        });

        var updated = await svc.UpdateProfileAsync(reg.UserId, new UpdateProfileRequest { FullName = "NewName" });
        Assert.Equal("NewName", updated.FullName);
    }

    [Fact]
    public async Task ChangePassword_WorksWithCorrectCurrent()
    {
        var svc = CreateService(out _);
        var reg = await svc.RegisterAsync(new RegisterRequest
        {
            FullName = "Frank",
            Email = "frank@example.com",
            Password = "OldPass1!"
        });

        await svc.ChangePasswordAsync(reg.UserId, new ChangePasswordRequest
        {
            CurrentPassword = "OldPass1!",
            NewPassword = "NewPass1!",
            ConfirmNewPassword = "NewPass1!"
        });

        // Login with new password should work
        var result = await svc.LoginAsync(new LoginRequest
        {
            Email = "frank@example.com",
            Password = "NewPass1!"
        });
        Assert.NotEmpty(result.Token);
    }

    [Fact]
    public async Task ChangePassword_ThrowsOnWrongCurrent()
    {
        var svc = CreateService(out _);
        var reg = await svc.RegisterAsync(new RegisterRequest
        {
            FullName = "Grace",
            Email = "grace@example.com",
            Password = "Correct1!"
        });

        await Assert.ThrowsAsync<ArgumentException>(() =>
            svc.ChangePasswordAsync(reg.UserId, new ChangePasswordRequest
            {
                CurrentPassword = "Wrong1!",
                NewPassword = "New1!",
                ConfirmNewPassword = "New1!"
            })
        );
    }
}
