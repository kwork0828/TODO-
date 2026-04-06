export type Priority = "urgent" | "high" | "medium" | "low";

export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue";

export interface ICategory {
  _id?: string;
  name: string;
  color: string;
  order: number;
  isArchived?: boolean;
}

export interface ITask {
  _id?: string;
  title: string;
  description?: string;
  category: string; // maps to Google Sheet tab name
  priority: Priority;
  status: TaskStatus;
  startDate?: Date;
  dueDate: Date;
  completedDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
