namespace RiskWatch.Api.DTOs.Predictions;

public class PredictionResponse
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = string.Empty;
    public Guid? TaskId { get; set; }
    public string? TaskTitle { get; set; }
    public Guid RiskMetricId { get; set; }
    public double DelayProbability { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public List<string> TopFactors { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
    public string RequestedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

// DTO for calling the Python AI service
public class AiPredictionRequest
{
    public double TaskComplexity { get; set; }
    public double TeamWorkload { get; set; }
    public int RequirementChanges { get; set; }
    public int BugCount { get; set; }
    public int DependencyCount { get; set; }
    public double ResourceAvailability { get; set; }
    public double EstimatedDuration { get; set; }
    public double ActualDuration { get; set; }
    public double SprintVelocity { get; set; }
    public double CommunicationDelay { get; set; }
    public int PreviousDelayCount { get; set; }
    public double TeamExperienceLevel { get; set; }
    public int PriorityLevel { get; set; }
}

// DTO for receiving response from Python AI service
public class AiPredictionResponse
{
    public double DelayProbability { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public List<string> TopFactors { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
}
