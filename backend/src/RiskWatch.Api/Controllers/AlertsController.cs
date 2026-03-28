using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RiskWatch.Api.DTOs.Alerts;
using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.Services.Interfaces;

namespace RiskWatch.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Tags("Alerts")]
[Authorize]
public class AlertsController : ControllerBase
{
    private readonly IAlertService _alertService;

    public AlertsController(IAlertService alertService)
    {
        _alertService = alertService;
    }

    /// <summary>Get current user's alerts (paginated)</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<AlertResponse>>), 200)]
    public async Task<IActionResult> GetAlerts([FromQuery] PaginationQuery query)
    {
        var result = await _alertService.GetUserAlertsAsync(GetUserId(), query);
        return Ok(ApiResponse<PaginatedResponse<AlertResponse>>.Ok(result));
    }

    /// <summary>Get unread alert count</summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(ApiResponse<int>), 200)]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _alertService.GetUnreadCountAsync(GetUserId());
        return Ok(ApiResponse<int>.Ok(count));
    }

    /// <summary>Mark an alert as read</summary>
    [HttpPatch("{id:guid}/read")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        await _alertService.MarkAsReadAsync(id, GetUserId());
        return Ok(ApiResponse.Ok("Alert marked as read"));
    }

    /// <summary>Mark all alerts as read</summary>
    [HttpPatch("read-all")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _alertService.MarkAllAsReadAsync(GetUserId());
        return Ok(ApiResponse.Ok("All alerts marked as read"));
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
