using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using RiskWatch.Api.Entities;
using RiskWatch.Api.Helpers;

namespace RiskWatch.Tests.Unit;

public class JwtHelperTests
{
    private readonly JwtHelper _jwt;

    public JwtHelperTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "SuperSecretTestKeyThatIsAtLeast32CharsLong!!!",
                ["Jwt:Issuer"] = "TestIssuer",
                ["Jwt:Audience"] = "TestAudience",
                ["Jwt:ExpiresInHours"] = "2",
            })
            .Build();
        _jwt = new JwtHelper(config);
    }

    private static User CreateTestUser() => new()
    {
        Id = Guid.NewGuid(),
        FullName = "John Doe",
        Email = "john@example.com",
        PasswordHash = "hash"
    };

    [Fact]
    public void GenerateToken_ReturnsNonEmptyToken()
    {
        var user = CreateTestUser();
        var (token, _) = _jwt.GenerateToken(user, ["ProjectManager"]);
        Assert.NotEmpty(token);
    }

    [Fact]
    public void GenerateToken_ExpiresInConfiguredHours()
    {
        var user = CreateTestUser();
        var (_, expiresAt) = _jwt.GenerateToken(user, ["Admin"]);
        var diff = expiresAt - DateTime.UtcNow;
        Assert.True(diff.TotalMinutes > 110 && diff.TotalMinutes < 125);
    }

    [Fact]
    public void GenerateToken_ContainsCorrectClaims()
    {
        var user = CreateTestUser();
        var (token, _) = _jwt.GenerateToken(user, ["Admin", "ProjectManager"]);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        Assert.Equal(user.Id.ToString(), jwt.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value);
        Assert.Equal(user.Email, jwt.Claims.First(c => c.Type == ClaimTypes.Email).Value);
        Assert.Equal(user.FullName, jwt.Claims.First(c => c.Type == ClaimTypes.Name).Value);
        Assert.Equal(2, jwt.Claims.Count(c => c.Type == ClaimTypes.Role));
    }

    [Fact]
    public void GenerateToken_HasCorrectIssuerAndAudience()
    {
        var user = CreateTestUser();
        var (token, _) = _jwt.GenerateToken(user, ["Admin"]);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        Assert.Equal("TestIssuer", jwt.Issuer);
        Assert.Contains("TestAudience", jwt.Audiences);
    }
}
