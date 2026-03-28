export interface RiskMetric {
  id: string;
  projectId: string;
  taskId?: string;
  taskComplexity: number;
  teamWorkload: number;
  requirementChanges: number;
  bugCount: number;
  dependencyCount: number;
  resourceAvailability: number;
  estimatedDuration: number;
  actualDuration?: number;
  sprintVelocity: number;
  communicationDelay: number;
  previousDelayCount: number;
  teamExperienceLevel: number;
  priorityLevel: number;
  recordedAt: string;
  createdAt: string;
}

export interface CreateRiskMetricRequest {
  taskId?: string;
  taskComplexity: number;
  teamWorkload: number;
  requirementChanges: number;
  bugCount: number;
  dependencyCount: number;
  resourceAvailability: number;
  estimatedDuration: number;
  actualDuration?: number;
  sprintVelocity: number;
  communicationDelay: number;
  previousDelayCount: number;
  teamExperienceLevel: number;
  priorityLevel: number;
}

export const RISK_METRIC_FIELDS: { key: keyof CreateRiskMetricRequest; label: string; min: number; max: number; step: number; hint: string }[] = [
  { key: 'taskComplexity', label: 'Task Complexity', min: 0, max: 10, step: 0.5, hint: '0 = trivial, 10 = extremely complex' },
  { key: 'teamWorkload', label: 'Team Workload', min: 0, max: 10, step: 0.5, hint: '0 = idle, 10 = overloaded' },
  { key: 'requirementChanges', label: 'Requirement Changes', min: 0, max: 100, step: 1, hint: 'Number of scope changes' },
  { key: 'bugCount', label: 'Bug Count', min: 0, max: 500, step: 1, hint: 'Known open bugs' },
  { key: 'dependencyCount', label: 'Dependency Count', min: 0, max: 50, step: 1, hint: 'External dependencies' },
  { key: 'resourceAvailability', label: 'Resource Availability', min: 0, max: 1, step: 0.05, hint: '0 = none, 1 = full availability' },
  { key: 'estimatedDuration', label: 'Estimated Duration (days)', min: 1, max: 365, step: 1, hint: 'Planned duration in days' },
  { key: 'actualDuration', label: 'Actual Duration (days)', min: 0, max: 365, step: 1, hint: 'Elapsed so far (optional)' },
  { key: 'sprintVelocity', label: 'Sprint Velocity', min: 0, max: 100, step: 1, hint: 'Story points per sprint' },
  { key: 'communicationDelay', label: 'Communication Delay', min: 0, max: 10, step: 0.5, hint: '0 = instant, 10 = severe delays' },
  { key: 'previousDelayCount', label: 'Previous Delay Count', min: 0, max: 50, step: 1, hint: 'Past schedule delays' },
  { key: 'teamExperienceLevel', label: 'Team Experience Level', min: 0, max: 10, step: 0.5, hint: '0 = junior, 10 = senior experts' },
  { key: 'priorityLevel', label: 'Priority Level', min: 1, max: 4, step: 1, hint: '1=Low, 2=Medium, 3=High, 4=Critical' },
];
