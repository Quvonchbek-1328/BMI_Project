namespace RiskWatch.Api.DTOs.Projects;

public class ProjectResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? Budget { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public int TaskCount { get; set; }
    public int CompletedTaskCount { get; set; }
    public double? LatestDelayProbability { get; set; }
    public string? LatestRiskLevel { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ProjectSummaryResponse
{
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int HighRiskTasks { get; set; }
    public double ProgressPercent { get; set; }
    public double? AverageDelayProbability { get; set; }
    public string OverallRiskLevel { get; set; } = "Low";
    public int AlertCount { get; set; }
}
