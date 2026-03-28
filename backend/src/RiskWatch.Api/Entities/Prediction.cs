namespace RiskWatch.Api.Entities;

public class Prediction
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid? TaskId { get; set; }
    public ProjectTask? Task { get; set; }
    public Guid RiskMetricId { get; set; }
    public RiskMetric RiskMetric { get; set; } = null!;
    public double DelayProbability { get; set; }     // 0-1
    public string RiskLevel { get; set; } = string.Empty; // Low / Medium / High
    public string TopFactorsJson { get; set; } = "[]";    // JSON array of strings
    public Guid RequestedById { get; set; }
    public User RequestedBy { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Recommendation> Recommendations { get; set; } = new List<Recommendation>();
}
