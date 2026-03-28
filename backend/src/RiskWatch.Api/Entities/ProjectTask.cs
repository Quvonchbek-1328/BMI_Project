namespace RiskWatch.Api.Entities;

public class ProjectTask
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = TaskItemStatus.Todo;
    public string Priority { get; set; } = TaskPriority.Medium;
    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }
    public decimal? EstimatedHours { get; set; }
    public decimal? ActualHours { get; set; }
    public DateTime? Deadline { get; set; }
    public int? Complexity { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<RiskMetric> RiskMetrics { get; set; } = new List<RiskMetric>();
    public ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();
}

public static class TaskItemStatus
{
    public const string Todo = "Todo";
    public const string InProgress = "InProgress";
    public const string InReview = "InReview";
    public const string Done = "Done";
    public const string Blocked = "Blocked";
}

public static class TaskPriority
{
    public const string Low = "Low";
    public const string Medium = "Medium";
    public const string High = "High";
    public const string Critical = "Critical";
}
