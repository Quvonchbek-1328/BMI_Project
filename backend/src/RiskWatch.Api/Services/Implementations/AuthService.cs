using Microsoft.EntityFrameworkCore;
using RiskWatch.Api.Data;
using RiskWatch.Api.DTOs.Auth;
using RiskWatch.Api.Entities;
using RiskWatch.Api.Helpers;
using RiskWatch.Api.Services.Interfaces;

namespace RiskWatch.Api.Services.Implementations;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly JwtHelper _jwt;

    public AuthService(AppDbContext db, JwtHelper jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            throw new ArgumentException("Email already registered");

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Email = request.Email.ToLower(),
            PasswordHash = PasswordHasher.Hash(request.Password)
        };

        var defaultRole = await _db.Roles.FirstAsync(r => r.Name == "ProjectManager");
        user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = defaultRole.Id });

        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();

        var roles = new List<string> { defaultRole.Name };
        var (token, expiresAt) = _jwt.GenerateToken(user, roles);

        return new AuthResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Token = token,
            Roles = roles,
            ExpiresAt = expiresAt
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower())
            ?? throw new KeyNotFoundException("Invalid email or password");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated");

        if (!PasswordHasher.Verify(request.Password, user.PasswordHash))
            throw new KeyNotFoundException("Invalid email or password");

        var roles = user.UserRoles.Select(ur => ur.Role.Name).ToList();
        var (token, expiresAt) = _jwt.GenerateToken(user, roles);

        return new AuthResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Token = token,
            Roles = roles,
            ExpiresAt = expiresAt
        };
    }

    public async Task<UserProfileResponse> GetProfileAsync(Guid userId)
    {
        var user = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found");

        return new UserProfileResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Roles = user.UserRoles.Select(ur => ur.Role.Name).ToList(),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserProfileResponse> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found");

        user.FullName = request.FullName;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return await GetProfileAsync(userId);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found");

        if (!PasswordHasher.Verify(request.CurrentPassword, user.PasswordHash))
            throw new ArgumentException("Current password is incorrect");

        user.PasswordHash = PasswordHasher.Hash(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }
}
