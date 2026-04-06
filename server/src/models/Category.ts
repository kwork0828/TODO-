import mongoose, { Schema, Document } from 'mongoose';
import { ICategory } from '../../../shared/types';

export interface ICategoryDocument extends Omit<ICategory, '_id'>, Document {}

const CategorySchema: Schema = new Schema({
  name: { type: String, unique: true, required: true },
  color: { type: String, required: true },
  order: { type: Number, required: true, default: 0 },
  isArchived: { type: Boolean, default: false }
});

export default mongoose.model<ICategoryDocument>('Category', CategorySchema);
