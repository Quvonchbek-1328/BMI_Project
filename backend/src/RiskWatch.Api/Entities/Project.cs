namespace RiskWatch.Api.Entities;

public class Project
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = ProjectStatus.NotStarted;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? Budget { get; set; }
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
    public ICollection<RiskMetric> RiskMetrics { get; set; } = new List<RiskMetric>();
    public ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();
    public ICollection<Alert> Alerts { get; set; } = new List<Alert>();
}

public static class ProjectStatus
{
    public const string NotStarted = "NotStarted";
    public const string InProgress = "InProgress";
    public const string OnHold = "OnHold";
    public const string Completed = "Completed";
    public const string Cancelled = "Cancelled";
}
