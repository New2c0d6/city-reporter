import { Router, Request, Response } from 'express';
import { createReport, getReportById, getAllReports } from '../services/reports.js';
import { validateCategoryId } from '../services/categories.js';
import { ReportFormData } from '../types/index.js';

const router = Router();

/**
 * POST /api/reports
 * Create a new report
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { category_id, title, description, location } = req.body;
    
    // Validate required fields
    if (!category_id || !title || !description) {
      res.status(400).json({
        error: 'Missing required fields: category_id, title, description',
      });
      return;
    }
    
    // Validate category exists
    const categoryExists = await validateCategoryId(category_id);
    if (!categoryExists) {
      res.status(400).json({ error: 'Invalid category_id' });
      return;
    }
    
    // Validate field types
    if (typeof title !== 'string' || typeof description !== 'string') {
      res.status(400).json({
        error: 'Invalid field types: title and description must be strings',
      });
      return;
    }
    
    // Validate field lengths
    if (title.length > 255) {
      res.status(400).json({ error: 'Title must be 255 characters or less' });
      return;
    }
    
    if (description.length > 5000) {
      res.status(400).json({ error: 'Description must be 5000 characters or less' });
      return;
    }
    
    const formData: ReportFormData = {
      category_id,
      title: title.trim(),
      description: description.trim(),
      location,
    };
    
    const report = await createReport(formData);
    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

/**
 * GET /api/reports
 * List all reports (TASK-601)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    
    const { reports, total } = await getAllReports(page, pageSize);
    
    res.json({
      items: reports,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

/**
 * GET /api/reports/:id
 * Get report details (TASK-603)
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await getReportById(id);
    
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    
    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

/**
 * PATCH /api/reports/:id/status
 * Update report status (TASK-701)
 */
router.patch('/:id/status', (_req: Request, res: Response) => {
  res.json({ message: 'Update status - TASK-701' });
});

export default router;
