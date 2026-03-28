using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RiskWatch.Api.DTOs.Common;
using RiskWatch.Api.DTOs.Tasks;
using RiskWatch.Api.Services.Interfaces;

namespace RiskWatch.Api.Controllers;

[ApiController]
[Tags("Tasks")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    /// <summary>Get tasks for a project (paginated)</summary>
    [HttpGet("api/projects/{projectId:guid}/tasks")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedResponse<TaskResponse>>), 200)]
    public async Task<IActionResult> GetByProject(Guid projectId, [FromQuery] PaginationQuery query)
    {
        var result = await _taskService.GetByProjectAsync(projectId, query);
        return Ok(ApiResponse<PaginatedResponse<TaskResponse>>.Ok(result));
    }

    /// <summary>Get task by ID</summary>
    [HttpGet("api/tasks/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<TaskResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _taskService.GetByIdAsync(id);
        return Ok(ApiResponse<TaskResponse>.Ok(result));
    }

    /// <summary>Create a task in a project</summary>
    [HttpPost("api/projects/{projectId:guid}/tasks")]
    [Authorize(Roles = "Admin,ProjectManager")]
    [ProducesResponseType(typeof(ApiResponse<TaskResponse>), 201)]
    [ProducesResponseType(typeof(ApiResponse), 400)]
    public async Task<IActionResult> Create(Guid projectId, [FromBody] CreateTaskRequest request)
    {
        var result = await _taskService.CreateAsync(projectId, request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<TaskResponse>.Ok(result, "Task created"));
    }

    /// <summary>Update a task</summary>
    [HttpPut("api/tasks/{id:guid}")]
    [Authorize(Roles = "Admin,ProjectManager")]
    [ProducesResponseType(typeof(ApiResponse<TaskResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTaskRequest request)
    {
        var result = await _taskService.UpdateAsync(id, request);
        return Ok(ApiResponse<TaskResponse>.Ok(result, "Task updated"));
    }

    /// <summary>Delete a task</summary>
    [HttpDelete("api/tasks/{id:guid}")]
    [Authorize(Roles = "Admin,ProjectManager")]
    [ProducesResponseType(typeof(ApiResponse), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _taskService.DeleteAsync(id);
        return Ok(ApiResponse.Ok("Task deleted"));
    }

    /// <summary>Update task status</summary>
    [HttpPatch("api/tasks/{id:guid}/status")]
    [ProducesResponseType(typeof(ApiResponse<TaskResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTaskStatusRequest request)
    {
        var result = await _taskService.UpdateStatusAsync(id, request.Status);
        return Ok(ApiResponse<TaskResponse>.Ok(result, "Status updated"));
    }

    /// <summary>Assign task to a user</summary>
    [HttpPatch("api/tasks/{id:guid}/assign")]
    [Authorize(Roles = "Admin,ProjectManager")]
    [ProducesResponseType(typeof(ApiResponse<TaskResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse), 404)]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignTaskRequest request)
    {
        var result = await _taskService.AssignAsync(id, request.AssigneeId);
        return Ok(ApiResponse<TaskResponse>.Ok(result, "Task assigned"));
    }
}
