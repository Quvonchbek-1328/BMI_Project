export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigneeId?: string;
  assigneeName?: string;
  estimatedHours?: number;
  actualHours?: number;
  deadline?: string;
  complexity?: number;
  latestDelayProbability?: number;
  latestRiskLevel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: string;
  assigneeId?: string;
  estimatedHours?: number;
  deadline?: string;
  complexity?: number;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigneeId?: string;
  estimatedHours?: number;
  actualHours?: number;
  deadline?: string;
  complexity?: number;
}

export const TASK_STATUSES = ['Todo', 'InProgress', 'InReview', 'Done', 'Blocked'] as const;
export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
export const PROJECT_STATUSES = ['NotStarted', 'InProgress', 'OnHold', 'Completed', 'Cancelled'] as const;
