import { Router, Request, Response } from 'express';

const router = Router();

/**
 * POST /api/uploads/presigned-url
 * Get presigned URL for S3 upload (TASK-401)
 */
router.post('/presigned-url', (_req: Request, res: Response) => {
  res.json({ message: 'Get presigned URL - TASK-401' });
});

export default router;
