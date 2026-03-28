"""
Rule-based recommendation engine.
Generates actionable suggestions based on feature values and risk level.
"""

from typing import List


def generate_recommendations(features: dict, risk_level: str) -> List[str]:
    """
    Generate recommendations based on input metrics and predicted risk level.

    Args:
        features: dict of feature name → value
        risk_level: "Low", "Medium", or "High"

    Returns:
        List of recommendation strings
    """
    recs: List[str] = []

    # Task complexity
    if features.get("task_complexity", 0) >= 7:
        recs.append("Break down complex tasks into smaller, manageable subtasks to reduce risk.")

    # Team workload
    if features.get("team_workload", 0) >= 7:
        recs.append("Consider redistributing workload or adding resources to the team.")

    # Requirement changes
    if features.get("requirement_changes", 0) >= 8:
        recs.append("Implement a stricter change-control process to minimize scope creep.")

    # Bug count
    if features.get("bug_count", 0) >= 15:
        recs.append("Prioritize code quality: increase code reviews and automated testing coverage.")

    # Dependency count
    if features.get("dependency_count", 0) >= 6:
        recs.append("Reduce external dependencies or establish fallback plans for critical ones.")

    # Resource availability
    if features.get("resource_availability", 1) < 0.5:
        recs.append("Secure additional resources or delay non-critical tasks to free capacity.")

    # Duration overrun
    est = features.get("estimated_duration", 1)
    act = features.get("actual_duration", 0)
    if est > 0 and act > est * 0.8:
        recs.append("Project is nearing or exceeding estimated duration — re-evaluate timeline.")

    # Sprint velocity
    if features.get("sprint_velocity", 100) < 15:
        recs.append("Investigate low sprint velocity: identify and remove team blockers.")

    # Communication delay
    if features.get("communication_delay", 0) >= 5:
        recs.append("Improve communication channels: consider daily standups or async update tools.")

    # Previous delays
    if features.get("previous_delay_count", 0) >= 3:
        recs.append("Conduct a retrospective on past delays to prevent recurring issues.")

    # Team experience
    if features.get("team_experience_level", 10) < 4:
        recs.append("Pair junior members with experienced mentors; invest in knowledge sharing.")

    # Priority pressure
    if features.get("priority_level", 1) >= 3:
        recs.append("High-priority project: establish clear milestones and frequent stakeholder check-ins.")

    # General risk-level based
    if risk_level == "High" and len(recs) == 0:
        recs.append("High risk detected: schedule an immediate risk review meeting with stakeholders.")
    elif risk_level == "Medium" and len(recs) == 0:
        recs.append("Moderate risk: continue monitoring metrics and be prepared to adjust plans.")
    elif risk_level == "Low" and len(recs) == 0:
        recs.append("Risk is low — maintain current practices and keep monitoring project health.")

    return recs[:6]  # Cap at 6 recommendations
