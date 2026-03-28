using FluentValidation;
using RiskWatch.Api.DTOs.Tasks;
using RiskWatch.Api.Entities;

namespace RiskWatch.Api.Validators;

public class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Task title is required")
            .MaximumLength(300);

        RuleFor(x => x.Priority)
            .Must(p => p is TaskPriority.Low or TaskPriority.Medium or TaskPriority.High or TaskPriority.Critical)
            .WithMessage("Priority must be Low, Medium, High, or Critical");

        RuleFor(x => x.Complexity)
            .InclusiveBetween(1, 10)
            .When(x => x.Complexity.HasValue)
            .WithMessage("Complexity must be between 1 and 10");

        RuleFor(x => x.EstimatedHours)
            .GreaterThan(0)
            .When(x => x.EstimatedHours.HasValue)
            .WithMessage("Estimated hours must be positive");
    }
}
