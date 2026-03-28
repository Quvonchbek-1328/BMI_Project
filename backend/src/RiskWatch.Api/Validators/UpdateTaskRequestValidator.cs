using FluentValidation;
using RiskWatch.Api.DTOs.Tasks;
using RiskWatch.Api.Entities;

namespace RiskWatch.Api.Validators;

public class UpdateTaskRequestValidator : AbstractValidator<UpdateTaskRequest>
{
    private static readonly string[] ValidStatuses =
    {
        TaskItemStatus.Todo, TaskItemStatus.InProgress,
        TaskItemStatus.InReview, TaskItemStatus.Done, TaskItemStatus.Blocked
    };

    private static readonly string[] ValidPriorities =
    {
        TaskPriority.Low, TaskPriority.Medium, TaskPriority.High, TaskPriority.Critical
    };

    public UpdateTaskRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Task title is required")
            .MaximumLength(300);

        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(s => ValidStatuses.Contains(s))
            .WithMessage("Status must be one of: Todo, InProgress, InReview, Done, Blocked");

        RuleFor(x => x.Priority)
            .NotEmpty()
            .Must(p => ValidPriorities.Contains(p))
            .WithMessage("Priority must be one of: Low, Medium, High, Critical");

        RuleFor(x => x.Complexity)
            .InclusiveBetween(1, 10)
            .When(x => x.Complexity.HasValue);

        RuleFor(x => x.EstimatedHours)
            .GreaterThan(0)
            .When(x => x.EstimatedHours.HasValue);

        RuleFor(x => x.ActualHours)
            .GreaterThanOrEqualTo(0)
            .When(x => x.ActualHours.HasValue);
    }
}
