import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/reports
 * List all reports (TASK-601)
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'List reports - TASK-601' });
});

/**
 * GET /api/reports/:id
 * Get report details (TASK-603)
 */
router.get('/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Get report details - TASK-603' });
});

/**
 * POST /api/reports
 * Create a new report (TASK-201)
 */
router.post('/', (_req: Request, res: Response) => {
  res.json({ message: 'Create report - TASK-201' });
});

/**
 * PATCH /api/reports/:id/status
 * Update report status (TASK-701)
 */
router.patch('/:id/status', (_req: Request, res: Response) => {
  res.json({ message: 'Update status - TASK-701' });
});

export default router;
