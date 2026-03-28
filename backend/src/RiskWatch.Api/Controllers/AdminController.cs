using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RiskWatch.Api.DTOs.Admin;
using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.Services.Interfaces;

namespace RiskWatch.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Tags("Admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    /// <summary>Get all users (paginated)</summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<UserListResponse>>), 200)]
    public async Task<IActionResult> GetUsers([FromQuery] PaginationQuery query)
    {
        var result = await _adminService.GetUsersAsync(query);
        return Ok(ApiResponse<PaginatedResponse<UserListResponse>>.Ok(result));
    }

    /// <summary>Change a user's role</summary>
    [HttpPatch("users/{id:guid}/role")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> ChangeUserRole(Guid id, [FromBody] ChangeUserRoleRequest request)
    {
        await _adminService.ChangeUserRoleAsync(id, request.Role);
        return Ok(ApiResponse.Ok("User role updated"));
    }

    /// <summary>Activate or deactivate a user</summary>
    [HttpPatch("users/{id:guid}/status")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> ChangeUserStatus(Guid id, [FromBody] ChangeUserStatusRequest request)
    {
        await _adminService.ChangeUserStatusAsync(id, request.IsActive);
        return Ok(ApiResponse.Ok("User status updated"));
    }

    /// <summary>Get system statistics</summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(ApiResponse<SystemStatsResponse>), 200)]
    public async Task<IActionResult> GetStats()
    {
        var result = await _adminService.GetStatsAsync();
        return Ok(ApiResponse<SystemStatsResponse>.Ok(result));
    }

    /// <summary>Dataset upload placeholder</summary>
    [HttpPost("dataset/upload")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    public IActionResult UploadDataset()
    {
        return Ok(ApiResponse.Ok("Dataset upload placeholder — not yet implemented"));
    }

    /// <summary>Get AI model info from Python service</summary>
    [HttpGet("model-info")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetModelInfo()
    {
        var info = await _adminService.GetModelInfoAsync();
        if (info == null)
            return Ok(ApiResponse<object>.Ok(new
            {
                Status = "AI service is unavailable",
                Message = "Make sure the Python AI service is running on port 8000"
            }));
        return Ok(ApiResponse<object>.Ok(info));
    }
}
