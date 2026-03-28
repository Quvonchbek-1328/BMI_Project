namespace RiskWatch.Api.DTOs.Admin;

public class UserListResponse
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ChangeUserRoleRequest
{
    public string Role { get; set; } = string.Empty;
}

public class ChangeUserStatusRequest
{
    public bool IsActive { get; set; }
}

public class SystemStatsResponse
{
    public int TotalUsers { get; set; }
    public int TotalProjects { get; set; }
    public int TotalTasks { get; set; }
    public int TotalPredictions { get; set; }
    public int HighRiskProjects { get; set; }
    public int ActiveAlerts { get; set; }
}
