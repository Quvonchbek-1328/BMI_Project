namespace RiskWatch.Api.Entities;

public class RiskMetric
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid? TaskId { get; set; }
    public ProjectTask? Task { get; set; }

    // Risk indicators
    public double TaskComplexity { get; set; }        // 0-10
    public double TeamWorkload { get; set; }           // 0-10
    public int RequirementChanges { get; set; }        // count
    public int BugCount { get; set; }                  // count
    public int DependencyCount { get; set; }           // count
    public double ResourceAvailability { get; set; }   // 0-1
    public double EstimatedDuration { get; set; }      // days
    public double? ActualDuration { get; set; }        // days
    public double SprintVelocity { get; set; }         // story points/sprint
    public double CommunicationDelay { get; set; }     // 0-10
    public int PreviousDelayCount { get; set; }        // count
    public double TeamExperienceLevel { get; set; }    // 0-10
    public int PriorityLevel { get; set; }             // 1-4

    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();
}
