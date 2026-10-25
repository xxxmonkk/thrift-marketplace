import { apiFetch, buildQuery } from './client';
import type { AdminListing, ReviewPayload, ReviewResponse, ListingStatus } from '../types/api';

/** GET /admin/listings?status=pending — admin only */
export async function getAdminListings(status?: ListingStatus): Promise<AdminListing[]> {
  return apiFetch<AdminListing[]>(`/admin/listings${buildQuery({ status })}`);
}

/** POST /admin/listings/:id/review — admin only; approve/reject/request changes */
export async function reviewListing(id: number, payload: ReviewPayload): Promise<ReviewResponse> {
  return apiFetch<ReviewResponse>(`/admin/listings/${id}/review`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
