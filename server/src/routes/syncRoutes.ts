import express from 'express';
import { forcePush, forcePull, fetchSyncStatus } from '../controllers/syncController';

const router = express.Router();

router.post('/push', forcePush);
router.post('/pull', forcePull);
router.get('/status', fetchSyncStatus);

export default router;
