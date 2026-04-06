import Task from '../models/Task';
import { pushToSheets } from './googleSheetsSync';

/**
 * Checks all non-completed tasks and marks them overdue if dueDate has passed.
 * Returns the count of tasks updated.
 */
export async function checkAndUpdateOverdueTasks(): Promise<number> {
  const now = new Date();

  const result = await Task.updateMany(
    {
      status: { $in: ['pending', 'in-progress'] },
      dueDate: { $lt: now },
    },
    { $set: { status: 'overdue' } }
  );

  const updatedCount = result.modifiedCount ?? 0;

  if (updatedCount > 0) {
    console.log(`[Overdue Check] Marked ${updatedCount} task(s) as overdue.`);
    try {
      await pushToSheets();
    } catch (e) {
      console.error('[Overdue Check] Failed to sync overdue updates to Sheets:', e);
    }
  }

  return updatedCount;
}
