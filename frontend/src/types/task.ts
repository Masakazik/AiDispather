export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: string;
  title: string;
  assigneeName: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  assigneeName?: string;
  dueDate?: string;
  priority?: TaskPriority;
}
