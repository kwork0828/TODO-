import express from 'express';
import { getStats } from '../controllers/taskController';

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', getStats);

export default router;
