import { Request, Response } from 'express';
import Task from '../models/Task';
import { pushToSheets } from '../services/googleSheetsSync';
import { checkAndUpdateOverdueTasks } from '../services/overdueService';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from '../utils/dateUtils';

// ─── GET /api/tasks ──────────────────────────────────────────────────────────
// Supports ?category=X&status=Y&priority=Z&sort=newest|oldest|dueSoon|priority
export const getTasks = async (req: Request, res: Response) => {
  try {
    await checkAndUpdateOverdueTasks();

    const { category, status, priority, sort } = req.query as Record<string, string>;

    const filter: Record<string, any> = {};
    if (category) filter.category = category;
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest:   { createdAt: -1 },
      oldest:   { createdAt:  1 },
      dueSoon:  { dueDate:    1 },
      priority: { priority:   1 },  // alphabetic — client handles display order
    };
    const sortOrder = sortMap[sort] ?? { dueDate: 1 };

    const tasks = await Task.find(filter).sort(sortOrder);
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/tasks/calendar?month=2026-04 ───────────────────────────────────
export const getCalendarTasks = async (req: Request, res: Response) => {
  try {
    const { month } = req.query as { month?: string };

    let start: Date;
    let end: Date;

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [year, mon] = month.split('-').map(Number);
      // Include one week buffer on each side so calendar edges look full
      start = new Date(year, mon - 1, 1);
      start.setDate(start.getDate() - 7);
      end = new Date(year, mon, 0);   // last day of requested month
      end.setDate(end.getDate() + 7);
    } else {
      // Default: return all tasks
      const tasks = await Task.find().sort({ dueDate: 1 });
      return res.json(tasks);
    }

    const tasks = await Task.find({
      $or: [
        { dueDate:   { $gte: start, $lte: end } },
        { startDate: { $gte: start, $lte: end } },
        // duration tasks that span the month
        { startDate: { $lte: start }, dueDate: { $gte: end } },
      ]
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/tasks/stats  (also mounted at /api/dashboard/stats) ────────────
export const getStats = async (req: Request, res: Response) => {
  try {
    await checkAndUpdateOverdueTasks();

    const now = new Date();
    const todayStart  = startOfDay(now);
    const todayEnd    = endOfDay(now);
    const weekStart   = startOfWeek(now);
    const weekEnd     = endOfWeek(now);
    const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekEnd   = new Date(weekEnd.getTime()   - 7 * 24 * 60 * 60 * 1000);

    const [
      total,
      overdue,
      dueToday,
      dueThisWeek,
      completedThisWeek,
      completedLastWeek,
      totalThisWeek,
    ] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'overdue' }),
      Task.countDocuments({ dueDate: { $gte: todayStart, $lte: todayEnd }, status: { $ne: 'completed' } }),
      Task.countDocuments({ dueDate: { $gte: weekStart, $lte: weekEnd }, status: { $ne: 'completed' } }),
      Task.countDocuments({ completedDate: { $gte: weekStart, $lte: weekEnd } }),
      Task.countDocuments({ completedDate: { $gte: lastWeekStart, $lte: lastWeekEnd } }),
      Task.countDocuments({ dueDate: { $gte: weekStart, $lte: weekEnd } }),
    ]);

    const completionRateThisWeek = totalThisWeek > 0
      ? Math.round((completedThisWeek / totalThisWeek) * 100)
      : 0;
    const completionRateLastWeek = totalThisWeek > 0
      ? Math.round((completedLastWeek / totalThisWeek) * 100)
      : 0;

    res.json({
      total,
      overdue,
      dueToday,
      dueThisWeek,
      completedThisWeek,
      completionRateThisWeek,
      completionRateLastWeek,
      weekOverWeekDelta: completionRateThisWeek - completionRateLastWeek,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/tasks ─────────────────────────────────────────────────────────
export const createTask = async (req: Request, res: Response) => {
  try {
    const task = new Task(req.body);
    const savedTask = await task.save();
    await pushToSheets();
    res.status(201).json(savedTask);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Auto-fill completedDate when marking completed
    if (updateData.status === 'completed' && !updateData.completedDate) {
      updateData.completedDate = new Date();
    }
    // Clear completedDate when un-completing
    if (updateData.status && updateData.status !== 'completed') {
      updateData.completedDate = undefined;
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedTask) return res.status(404).json({ message: '태스크를 찾을 수 없습니다.' });

    await pushToSheets();
    res.json(updatedTask);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: '태스크를 찾을 수 없습니다.' });

    await pushToSheets();
    res.json({ message: '태스크가 삭제되었습니다.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
