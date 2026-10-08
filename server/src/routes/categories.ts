import { Router, Request, Response } from 'express';
import { getAllCategories } from '../services/categories.js';

const router = Router();

/**
 * GET /api/categories
 * List all categories
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
