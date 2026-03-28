using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.DTOs.Projects;
using RiskWatch.Api.Services.Interfaces;

namespace RiskWatch.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Tags("Projects")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    /// <summary>Get all projects (paginated)</summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<ProjectResponse>>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] PaginationQuery query)
    {
        var result = await _projectService.GetAllAsync(GetUserId(), query);
        return Ok(ApiResponse<PaginatedResponse<ProjectResponse>>.Ok(result));
    }

    /// <summary>Get project by ID</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ProjectResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _projectService.GetByIdAsync(id, GetUserId());
        return Ok(ApiResponse<ProjectResponse>.Ok(result));
    }

    /// <summary>Create a new project</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,ProjectManager")]
    [ProducesResponseType(typeof(ApiResponse<ProjectResponse>), 201)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest request)
    {
        var result = await _projectService.CreateAsync(request, GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<ProjectResponse>.Ok(result, "Project created"));
    }

    /// <summary>Update a project</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,ProjectManager")]
    [ProducesResponseType(typeof(ApiResponse<ProjectResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProjectRequest request)
    {
        var result = await _projectService.UpdateAsync(id, request, GetUserId());
        return Ok(ApiResponse<ProjectResponse>.Ok(result, "Project updated"));
    }

    /// <summary>Delete a project</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,ProjectManager")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _projectService.DeleteAsync(id, GetUserId());
        return Ok(ApiResponse.Ok("Project deleted"));
    }

    /// <summary>Get project health summary</summary>
    [HttpGet("{id:guid}/summary")]
    [ProducesResponseType(typeof(ApiResponse<ProjectSummaryResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> GetSummary(Guid id)
    {
        var result = await _projectService.GetSummaryAsync(id, GetUserId());
        return Ok(ApiResponse<ProjectSummaryResponse>.Ok(result));
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
