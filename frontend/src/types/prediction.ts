export interface Prediction {
  id: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskTitle?: string;
  riskMetricId: string;
  delayProbability: number;
  riskLevel: string;
  topFactors: string[];
  recommendations: string[];
  requestedByName: string;
  createdAt: string;
}

export interface RunPredictionRequest {
  riskMetricId: string;
}
