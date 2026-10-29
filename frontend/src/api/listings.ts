import { apiFetch, buildQuery } from './client';
import type {
  Listing,
  ListingDetail,
  ListingFilters,
  CreateListingPayload,
  CreateListingResponse,
} from '../types/api';

/** GET /listings — public, returns only live listings */
export async function getListings(filters?: ListingFilters): Promise<Listing[]> {
  const params: Record<string, string | number | undefined | null> = {
    category: filters?.category,
    era: filters?.era,
    q: filters?.q,
    min_price: filters?.min_price,
    max_price: filters?.max_price,
  };
  return apiFetch<Listing[]>(`/listings${buildQuery(params)}`);
}

/** GET /listings/:id — public for live/sold; auth required for others */
export async function getListingById(id: number): Promise<ListingDetail> {
  return apiFetch<ListingDetail>(`/listings/${id}`);
}

/** GET /listings/mine — seller only */
export async function getMyListings(): Promise<Listing[]> {
  return apiFetch<Listing[]>('/listings/mine');
}

/** POST /listings — seller only; new listing starts as 'pending' */
export async function createListing(payload: CreateListingPayload): Promise<CreateListingResponse> {
  return apiFetch<CreateListingResponse>('/listings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
