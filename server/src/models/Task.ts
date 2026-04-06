import mongoose, { Schema, Document } from 'mongoose';
import { ITask } from '../../../shared/types';

export interface ITaskDocument extends Omit<ITask, '_id'>, Document {}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ["urgent", "high", "medium", "low"],
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "in-progress", "completed", "overdue"],
    default: "pending",
    required: true 
  },
  startDate: { type: Date },
  dueDate: { type: Date, required: true },
  completedDate: { type: Date },
}, { 
  timestamps: true 
});

export default mongoose.model<ITaskDocument>('Task', TaskSchema);
