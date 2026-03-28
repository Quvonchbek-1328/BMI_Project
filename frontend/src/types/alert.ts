export interface Alert {
  id: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskTitle?: string;
  title: string;
  message: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
}
