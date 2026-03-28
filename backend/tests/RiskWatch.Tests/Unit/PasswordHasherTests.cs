using RiskWatch.Api.Helpers;

namespace RiskWatch.Tests.Unit;

public class PasswordHasherTests
{
    [Fact]
    public void Hash_ShouldReturnNonEmptyString()
    {
        var hash = PasswordHasher.Hash("TestPassword123");
        Assert.NotEmpty(hash);
        Assert.Contains(".", hash);
    }

    [Fact]
    public void Verify_ShouldReturnTrue_ForCorrectPassword()
    {
        var password = "MySecurePass!";
        var hash = PasswordHasher.Hash(password);
        Assert.True(PasswordHasher.Verify(password, hash));
    }

    [Fact]
    public void Verify_ShouldReturnFalse_ForWrongPassword()
    {
        var hash = PasswordHasher.Hash("CorrectPass");
        Assert.False(PasswordHasher.Verify("WrongPass", hash));
    }
}
