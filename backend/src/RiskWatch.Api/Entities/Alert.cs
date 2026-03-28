namespace RiskWatch.Api.Entities;

public class Alert
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid? TaskId { get; set; }
    public ProjectTask? Task { get; set; }
    public Guid? PredictionId { get; set; }
    public Prediction? Prediction { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = AlertSeverity.Low;
    public bool IsRead { get; set; } = false;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public static class AlertSeverity
{
    public const string Low = "Low";
    public const string Medium = "Medium";
    public const string High = "High";
    public const string Critical = "Critical";
}
