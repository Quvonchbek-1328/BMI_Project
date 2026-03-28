using FluentValidation;
using RiskWatch.Api.DTOs.RiskMetrics;

namespace RiskWatch.Api.Validators;

public class CreateRiskMetricRequestValidator : AbstractValidator<CreateRiskMetricRequest>
{
    public CreateRiskMetricRequestValidator()
    {
        RuleFor(x => x.TaskComplexity).InclusiveBetween(0, 10).WithMessage("Task complexity must be 0-10");
        RuleFor(x => x.TeamWorkload).InclusiveBetween(0, 10).WithMessage("Team workload must be 0-10");
        RuleFor(x => x.RequirementChanges).GreaterThanOrEqualTo(0);
        RuleFor(x => x.BugCount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.DependencyCount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ResourceAvailability).InclusiveBetween(0, 1).WithMessage("Resource availability must be 0-1");
        RuleFor(x => x.EstimatedDuration).GreaterThan(0).WithMessage("Estimated duration must be positive");
        RuleFor(x => x.SprintVelocity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CommunicationDelay).InclusiveBetween(0, 10).WithMessage("Communication delay must be 0-10");
        RuleFor(x => x.PreviousDelayCount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.TeamExperienceLevel).InclusiveBetween(0, 10).WithMessage("Team experience must be 0-10");
        RuleFor(x => x.PriorityLevel).InclusiveBetween(1, 4).WithMessage("Priority level must be 1-4");
    }
}
