using FluentValidation;
using RiskWatch.Api.DTOs.Projects;
using RiskWatch.Api.Entities;

namespace RiskWatch.Api.Validators;

public class UpdateProjectRequestValidator : AbstractValidator<UpdateProjectRequest>
{
    private static readonly string[] ValidStatuses =
    {
        ProjectStatus.NotStarted, ProjectStatus.InProgress,
        ProjectStatus.OnHold, ProjectStatus.Completed, ProjectStatus.Cancelled
    };

    public UpdateProjectRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Project name is required")
            .MaximumLength(200);

        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(s => ValidStatuses.Contains(s))
            .WithMessage("Status must be one of: NotStarted, InProgress, OnHold, Completed, Cancelled");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required");

        RuleFor(x => x.EndDate)
            .GreaterThan(x => x.StartDate)
            .When(x => x.EndDate.HasValue)
            .WithMessage("End date must be after start date");

        RuleFor(x => x.Budget)
            .GreaterThanOrEqualTo(0)
            .When(x => x.Budget.HasValue);
    }
}
