using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.DTOs.Predictions;
using RiskWatch.Api.Services.Interfaces;

namespace RiskWatch.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Tags("Predictions")]
[Authorize]
public class PredictionsController : ControllerBase
{
    private readonly IPredictionService _predictionService;

    public PredictionsController(IPredictionService predictionService)
    {
        _predictionService = predictionService;
    }

    /// <summary>Run a prediction for a risk metric</summary>
    [HttpPost("run")]
    [Authorize(Roles = "Admin,ProjectManager")]
    [ProducesResponseType(typeof(ApiResponse<PredictionResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> RunPrediction([FromBody] RunPredictionRequest request)
    {
        var userId = GetUserId();
        var result = await _predictionService.RunPredictionAsync(request, userId);
        return Ok(ApiResponse<PredictionResponse>.Ok(result, "Prediction completed"));
    }

    /// <summary>Get predictions for a project</summary>
    [HttpGet("~/api/projects/{projectId:guid}/predictions")]
    [ProducesResponseType(typeof(ApiResponse<List<PredictionResponse>>), 200)]
    public async Task<IActionResult> GetByProject(Guid projectId)
    {
        var result = await _predictionService.GetByProjectAsync(projectId);
        return Ok(ApiResponse<List<PredictionResponse>>.Ok(result));
    }

    /// <summary>Get prediction by ID</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PredictionResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _predictionService.GetByIdAsync(id);
        return Ok(ApiResponse<PredictionResponse>.Ok(result));
    }

    /// <summary>Get latest predictions across all projects</summary>
    [HttpGet("latest")]
    [ProducesResponseType(typeof(ApiResponse<List<PredictionResponse>>), 200)]
    public async Task<IActionResult> GetLatest()
    {
        var userId = GetUserId();
        var result = await _predictionService.GetLatestAsync(userId);
        return Ok(ApiResponse<List<PredictionResponse>>.Ok(result));
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
