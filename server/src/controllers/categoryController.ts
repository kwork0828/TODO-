import { Request, Response } from 'express';
import Category from '../models/Category';
import { archiveSheet } from '../services/googleSheetsSync';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (category) {
      await archiveSheet(category.name);
      await Category.findByIdAndDelete(id);
    }
    res.json({ message: '카테고리가 삭제되고 시트가 보관되었습니다.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
