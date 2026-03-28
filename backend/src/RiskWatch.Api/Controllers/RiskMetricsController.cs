using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.DTOs.RiskMetrics;
using RiskWatch.Api.Services.Interfaces;

namespace RiskWatch.Api.Controllers;

[ApiController]
[Tags("RiskMetrics")]
[Authorize]
public class RiskMetricsController : ControllerBase
{
    private readonly IRiskMetricService _riskMetricService;

    public RiskMetricsController(IRiskMetricService riskMetricService)
    {
        _riskMetricService = riskMetricService;
    }

    /// <summary>Get risk metrics for a project</summary>
    [HttpGet("api/projects/{projectId:guid}/risk-metrics")]
    [ProducesResponseType(typeof(ApiResponse<List<RiskMetricResponse>>), 200)]
    public async Task<IActionResult> GetByProject(Guid projectId)
    {
        var result = await _riskMetricService.GetByProjectAsync(projectId);
        return Ok(ApiResponse<List<RiskMetricResponse>>.Ok(result));
    }

    /// <summary>Get a single risk metric by ID</summary>
    [HttpGet("api/risk-metrics/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<RiskMetricResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _riskMetricService.GetByIdAsync(id);
        return Ok(ApiResponse<RiskMetricResponse>.Ok(result));
    }

    /// <summary>Create a risk metric entry for a project</summary>
    [HttpPost("api/projects/{projectId:guid}/risk-metrics")]
    [Authorize(Roles = "Admin,ProjectManager")]
    [ProducesResponseType(typeof(ApiResponse<RiskMetricResponse>), 201)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    public async Task<IActionResult> Create(Guid projectId, [FromBody] CreateRiskMetricRequest request)
    {
        var result = await _riskMetricService.CreateAsync(projectId, request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            ApiResponse<RiskMetricResponse>.Ok(result, "Risk metric created"));
    }

    /// <summary>Get risk metric history for a project</summary>
    [HttpGet("api/projects/{projectId:guid}/risk-metrics/history")]
    [ProducesResponseType(typeof(ApiResponse<List<RiskMetricResponse>>), 200)]
    public async Task<IActionResult> GetHistory(Guid projectId)
    {
        var result = await _riskMetricService.GetHistoryAsync(projectId);
        return Ok(ApiResponse<List<RiskMetricResponse>>.Ok(result));
    }
}
