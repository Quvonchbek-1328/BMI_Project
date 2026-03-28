using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RiskWatch.Api.Data;
using RiskWatch.Api.DTOs.Predictions;
using RiskWatch.Api.Entities;
using RiskWatch.Api.Services.Interfaces;

namespace RiskWatch.Api.Services.Implementations;

public class PredictionService : IPredictionService
{
    private readonly AppDbContext _db;
    private readonly HttpClient _httpClient;
    private readonly IAlertService _alertService;

    public PredictionService(AppDbContext db, IHttpClientFactory httpClientFactory, IAlertService alertService)
    {
        _db = db;
        _httpClient = httpClientFactory.CreateClient("AiService");
        _alertService = alertService;
    }

    public async Task<PredictionResponse> RunPredictionAsync(RunPredictionRequest request, Guid userId)
    {
        var metric = await _db.RiskMetrics.FindAsync(request.RiskMetricId)
            ?? throw new KeyNotFoundException("Risk metric not found");

        // Build AI request
        var aiRequest = new AiPredictionRequest
        {
            TaskComplexity = metric.TaskComplexity,
            TeamWorkload = metric.TeamWorkload,
            RequirementChanges = metric.RequirementChanges,
            BugCount = metric.BugCount,
            DependencyCount = metric.DependencyCount,
            ResourceAvailability = metric.ResourceAvailability,
            EstimatedDuration = metric.EstimatedDuration,
            ActualDuration = metric.ActualDuration ?? metric.EstimatedDuration,
            SprintVelocity = metric.SprintVelocity,
            CommunicationDelay = metric.CommunicationDelay,
            PreviousDelayCount = metric.PreviousDelayCount,
            TeamExperienceLevel = metric.TeamExperienceLevel,
            PriorityLevel = metric.PriorityLevel
        };

        // Call Python AI service
        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };
        var content = new StringContent(JsonSerializer.Serialize(aiRequest, jsonOptions), System.Text.Encoding.UTF8, "application/json");

        HttpResponseMessage response;
        try
        {
            response = await _httpClient.PostAsync("/predict", content);
        }
        catch (HttpRequestException ex)
        {
            throw new InvalidOperationException("AI service is unavailable. Make sure it is running on the configured port.", ex);
        }

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"AI service returned {(int)response.StatusCode}: {errorBody}");
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        var aiResponse = JsonSerializer.Deserialize<AiPredictionResponse>(responseJson, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
        }) ?? throw new InvalidOperationException("Failed to parse AI response");

        // Save prediction
        var prediction = new Prediction
        {
            Id = Guid.NewGuid(),
            ProjectId = metric.ProjectId,
            TaskId = metric.TaskId,
            RiskMetricId = metric.Id,
            DelayProbability = aiResponse.DelayProbability,
            RiskLevel = aiResponse.RiskLevel,
            TopFactorsJson = JsonSerializer.Serialize(aiResponse.TopFactors),
            RequestedById = userId
        };

        await _db.Predictions.AddAsync(prediction);

        // Save recommendations
        for (int i = 0; i < aiResponse.Recommendations.Count; i++)
        {
            await _db.Recommendations.AddAsync(new Recommendation
            {
                Id = Guid.NewGuid(),
                PredictionId = prediction.Id,
                Text = aiResponse.Recommendations[i],
                Priority = i + 1
            });
        }

        await _db.SaveChangesAsync();

        // Create alert if high risk
        if (aiResponse.RiskLevel == "High")
        {
            await _alertService.CreateAlertAsync(
                metric.ProjectId, metric.TaskId, prediction.Id,
                "High Risk Detected",
                $"Delay probability: {aiResponse.DelayProbability:P0}. Top factor: {aiResponse.TopFactors.FirstOrDefault() ?? "N/A"}",
                AlertSeverity.High, userId);
        }

        return await GetByIdAsync(prediction.Id);
    }

    public async Task<List<PredictionResponse>> GetByProjectAsync(Guid projectId)
    {
        return await _db.Predictions
            .Include(p => p.Project).Include(p => p.Task)
            .Include(p => p.Recommendations).Include(p => p.RequestedBy)
            .Where(p => p.ProjectId == projectId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => MapToResponse(p))
            .ToListAsync();
    }

    public async Task<PredictionResponse> GetByIdAsync(Guid id)
    {
        var prediction = await _db.Predictions
            .Include(p => p.Project).Include(p => p.Task)
            .Include(p => p.Recommendations).Include(p => p.RequestedBy)
            .FirstOrDefaultAsync(p => p.Id == id)
            ?? throw new KeyNotFoundException("Prediction not found");
        return MapToResponse(prediction);
    }

    public async Task<List<PredictionResponse>> GetLatestAsync(Guid userId)
    {
        return await _db.Predictions
            .Include(p => p.Project).Include(p => p.Task)
            .Include(p => p.Recommendations).Include(p => p.RequestedBy)
            .OrderByDescending(p => p.CreatedAt)
            .Take(20)
            .Select(p => MapToResponse(p))
            .ToListAsync();
    }

    private static PredictionResponse MapToResponse(Prediction p) => new()
    {
        Id = p.Id,
        ProjectId = p.ProjectId,
        ProjectName = p.Project?.Name ?? "",
        TaskId = p.TaskId,
        TaskTitle = p.Task?.Title,
        RiskMetricId = p.RiskMetricId,
        DelayProbability = p.DelayProbability,
        RiskLevel = p.RiskLevel,
        TopFactors = JsonSerializer.Deserialize<List<string>>(p.TopFactorsJson) ?? new(),
        Recommendations = p.Recommendations?.OrderBy(r => r.Priority).Select(r => r.Text).ToList() ?? new(),
        RequestedByName = p.RequestedBy?.FullName ?? "",
        CreatedAt = p.CreatedAt
    };
}
