namespace RiskWatch.Api.DTOs.RiskMetrics;

public class CreateRiskMetricRequest
{
    public Guid? TaskId { get; set; }
    public double TaskComplexity { get; set; }
    public double TeamWorkload { get; set; }
    public int RequirementChanges { get; set; }
    public int BugCount { get; set; }
    public int DependencyCount { get; set; }
    public double ResourceAvailability { get; set; }
    public double EstimatedDuration { get; set; }
    public double? ActualDuration { get; set; }
    public double SprintVelocity { get; set; }
    public double CommunicationDelay { get; set; }
    public int PreviousDelayCount { get; set; }
    public double TeamExperienceLevel { get; set; }
    public int PriorityLevel { get; set; }
}
