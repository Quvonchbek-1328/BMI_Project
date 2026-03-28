export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  ownerName: string;
  ownerId: string;
  taskCount: number;
  completedTaskCount: number;
  latestDelayProbability?: number;
  latestRiskLevel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  budget?: number;
}

export interface UpdateProjectRequest {
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
  budget?: number;
}

export interface ProjectSummary {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  highRiskTasks: number;
  progressPercent: number;
  averageDelayProbability?: number;
  overallRiskLevel: string;
  alertCount: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
