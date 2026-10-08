import { query } from '../db/connection.js';
import { Report, ReportFormData } from '../types/index.js';

/**
 * Generate a unique reference number for a report
 * Format: REP-YYYY-NNNNN (e.g., REP-2026-00001)
 */
export async function generateReferenceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  
  // Get the count of reports created this year
  const result = await query(
    `SELECT COUNT(*) as count FROM reports 
     WHERE EXTRACT(YEAR FROM created_at) = $1`,
    [year]
  );
  
  const count = (result.rows[0] as { count: string }).count;
  const nextNumber = (parseInt(count, 10) + 1).toString().padStart(5, '0');
  
  return `REP-${year}-${nextNumber}`;
}

/**
 * Create a new report
 */
export async function createReport(formData: ReportFormData): Promise<Report> {
  const referenceNumber = await generateReferenceNumber();
  
  const result = await query(
    `INSERT INTO reports (
      reference_number,
      category_id,
      title,
      description,
      status,
      priority,
      location_latitude,
      location_longitude,
      location_accuracy,
      location_timestamp,
      location_address
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING 
      id,
      reference_number,
      category_id,
      title,
      description,
      status,
      priority,
      location_latitude,
      location_longitude,
      location_accuracy,
      location_timestamp,
      location_address,
      created_at,
      updated_at
    `,
    [
      referenceNumber,
      formData.category_id,
      formData.title,
      formData.description,
      'NEW', // Default status
      'MEDIUM', // Default priority
      formData.location?.latitude || null,
      formData.location?.longitude || null,
      formData.location?.accuracy || null,
      formData.location?.timestamp || null,
      formData.location?.address || null,
    ]
  );
  
  return result.rows[0] as Report;
}

/**
 * Get a report by ID
 */
export async function getReportById(id: string): Promise<Report | null> {
  const result = await query(
    `SELECT 
      id,
      reference_number,
      category_id,
      title,
      description,
      status,
      priority,
      location_latitude,
      location_longitude,
      location_accuracy,
      location_timestamp,
      location_address,
      created_at,
      updated_at
    FROM reports WHERE id = $1`,
    [id]
  );
  
  return (result.rows[0] as Report | undefined) || null;
}

/**
 * Get all reports with pagination
 */
export async function getAllReports(
  page: number = 1,
  pageSize: number = 20
): Promise<{ reports: Report[]; total: number }> {
  const offset = (page - 1) * pageSize;
  
  const totalResult = await query('SELECT COUNT(*) as count FROM reports');
  const total = parseInt((totalResult.rows[0] as { count: string }).count, 10);
  
  const result = await query(
    `SELECT 
      id,
      reference_number,
      category_id,
      title,
      description,
      status,
      priority,
      location_latitude,
      location_longitude,
      location_accuracy,
      location_timestamp,
      location_address,
      created_at,
      updated_at
    FROM reports
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2`,
    [pageSize, offset]
  );
  
  return {
    reports: result.rows as Report[],
    total,
  };
}
