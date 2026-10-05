import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/categories
 * List all categories (TASK-106)
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'List categories - TASK-106' });
});

export default router;
