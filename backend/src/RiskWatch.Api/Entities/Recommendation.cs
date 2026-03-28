namespace RiskWatch.Api.Entities;

public class Recommendation
{
    public Guid Id { get; set; }
    public Guid PredictionId { get; set; }
    public Prediction Prediction { get; set; } = null!;
    public string Text { get; set; } = string.Empty;
    public int Priority { get; set; } // 1-5
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
