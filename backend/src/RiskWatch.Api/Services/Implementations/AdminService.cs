using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RiskWatch.Api.Data;
using RiskWatch.Api.DTOs.Admin;
using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.Entities;
using RiskWatch.Api.Services.Interfaces;

namespace RiskWatch.Api.Services.Implementations;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;
    private readonly HttpClient _httpClient;

    public AdminService(AppDbContext db, IHttpClientFactory httpClientFactory)
    {
        _db = db;
        _httpClient = httpClientFactory.CreateClient("AiService");
    }

    public async Task<PaginatedResponse<UserListResponse>> GetUsersAsync(PaginationQuery query)
    {
        var q = _db.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role);

        var total = await q.CountAsync();
        var items = await q
            .OrderByDescending(u => u.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(u => new UserListResponse
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Roles = u.UserRoles.Select(ur => ur.Role.Name).ToList(),
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return new PaginatedResponse<UserListResponse>
        {
            Items = items, TotalCount = total, Page = query.Page, PageSize = query.PageSize
        };
    }

    public async Task ChangeUserRoleAsync(Guid userId, string role)
    {
        var user = await _db.Users.Include(u => u.UserRoles).FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new KeyNotFoundException("User not found");

        var newRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == role)
            ?? throw new ArgumentException($"Role '{role}' does not exist");

        user.UserRoles.Clear();
        user.UserRoles.Add(new UserRole { UserId = userId, RoleId = newRole.Id });
        await _db.SaveChangesAsync();
    }

    public async Task ChangeUserStatusAsync(Guid userId, bool isActive)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found");
        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task<SystemStatsResponse> GetStatsAsync()
    {
        return new SystemStatsResponse
        {
            TotalUsers = await _db.Users.CountAsync(),
            TotalProjects = await _db.Projects.CountAsync(),
            TotalTasks = await _db.ProjectTasks.CountAsync(),
            TotalPredictions = await _db.Predictions.CountAsync(),
            HighRiskProjects = await _db.Predictions
                .Where(p => p.RiskLevel == "High")
                .Select(p => p.ProjectId).Distinct().CountAsync(),
            ActiveAlerts = await _db.Alerts.CountAsync(a => !a.IsRead)
        };
    }

    public async Task<object?> GetModelInfoAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("/model-info");
            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<object>(json);
        }
        catch
        {
            return null;
        }
    }
}
