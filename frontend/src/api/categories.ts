import { apiFetch } from './client';
import type { Category } from '../types/api';

/** GET /categories — public */
export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories');
}
