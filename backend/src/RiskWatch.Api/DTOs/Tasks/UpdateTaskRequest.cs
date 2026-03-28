namespace RiskWatch.Api.DTOs.Tasks;

public class UpdateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public Guid? AssigneeId { get; set; }
    public decimal? EstimatedHours { get; set; }
    public decimal? ActualHours { get; set; }
    public DateTime? Deadline { get; set; }
    public int? Complexity { get; set; }
}

public class UpdateTaskStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class AssignTaskRequest
{
    public Guid? AssigneeId { get; set; }
}
