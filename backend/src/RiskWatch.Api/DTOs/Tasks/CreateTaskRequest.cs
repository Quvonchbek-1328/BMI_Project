namespace RiskWatch.Api.DTOs.Tasks;

public class CreateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "Medium";
    public Guid? AssigneeId { get; set; }
    public decimal? EstimatedHours { get; set; }
    public DateTime? Deadline { get; set; }
    public int? Complexity { get; set; }
}
