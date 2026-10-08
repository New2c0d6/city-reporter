import { query } from '../db/connection.js';
import { Category } from '../types/index.js';

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  const result = await query('SELECT id, name, created_at FROM categories ORDER BY id');
  return result.rows as Category[];
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: number): Promise<Category | null> {
  const result = await query('SELECT id, name, created_at FROM categories WHERE id = $1', [
    id,
  ]);
  return (result.rows[0] as Category | undefined) || null;
}

/**
 * Validate category ID exists
 */
export async function validateCategoryId(categoryId: number): Promise<boolean> {
  const category = await getCategoryById(categoryId);
  return category !== null;
}
