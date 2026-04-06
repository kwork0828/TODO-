import express from 'express';
import { getTasks, createTask, updateTask, deleteTask, getStats, getCalendarTasks } from '../controllers/taskController';

const router = express.Router();

// Specific routes must come before /:id
router.get('/stats', getStats);
router.get('/calendar', getCalendarTasks);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
