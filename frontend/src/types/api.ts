// ============================================================
// SALIXIR — API Types
// Matches the backend API contract exactly (docs/api-contract.md)
// ============================================================

// ── Auth ──────────────────────────────────────────────────
export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: number;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ── Categories ────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
}

// ── Listings ──────────────────────────────────────────────
export type ListingStatus = 'pending' | 'live' | 'rejected' | 'changes_requested' | 'sold';
export type ItemCondition = 'like new' | 'good' | 'fair';

/** Listing as returned by GET /listings (browse) and GET /listings/mine */
export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  item_condition: ItemCondition;
  era: string | null;
  status: ListingStatus;
  category_id: number;
  category_name: string;
  image_url: string | null;
  created_at: string;
  /** Only present on GET /listings/mine */
  review_reason?: string | null;
}

/** Listing image */
export interface ListingImage {
  id: number;
  url: string;
}

/** Full listing detail from GET /listings/:id */
export interface ListingDetail extends Omit<Listing, 'image_url'> {
  seller_id: number;
  seller_name: string;
  images: ListingImage[];
}

/** Admin listing detail (GET /admin/listings) */
export interface AdminListing extends Listing {
  seller_name: string;
  images: ListingImage[];
}

/** POST /listings request body */
export interface CreateListingPayload {
  title: string;
  description?: string;
  price: number;
  category_id: number;
  item_condition: ItemCondition;
  era?: string;
  image_urls: string[];
}

/** POST /listings response */
export interface CreateListingResponse {
  id: number;
  seller_id: number;
  category_id: number;
  title: string;
  description: string | null;
  price: number;
  item_condition: ItemCondition;
  era: string | null;
  status: ListingStatus;
  created_at: string;
  image_urls: string[];
}

// ── Admin review ──────────────────────────────────────────
export type ReviewDecision = 'approved' | 'rejected' | 'changes_requested';

export interface ReviewPayload {
  decision: ReviewDecision;
  reason?: string;
}

export interface ReviewResponse {
  id: number;
  status: ListingStatus;
}

// ── Cart ──────────────────────────────────────────────────
export interface CartItem {
  listing_id: number;
  title: string;
  price: number;
  status: ListingStatus;
  image_url: string | null;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// ── Orders ────────────────────────────────────────────────
export interface OrderItem {
  listing_id: number;
  title: string;
  price: number;
  /** present on GET /orders/mine */
  image_url?: string | null;
}

export interface Order {
  id: number;
  buyer_id: number;
  total: number;
  status: string;
  address: string;
  created_at: string;
  items: OrderItem[];
}

export interface CheckoutPayload {
  address: string;
  listing_ids?: number[];
}

// ── Query params for GET /listings ───────────────────────
export interface ListingFilters {
  category?: string;
  era?: string;
  q?: string;
  min_price?: number;
  max_price?: number;
}

// ── Generic API error ─────────────────────────────────────
export interface ApiError {
  error: string;
  listing_ids?: number[];
}
