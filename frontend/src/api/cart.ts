import { apiFetch } from './client';
import type { Cart } from '../types/api';

/** GET /cart — buyer only */
export async function getCart(): Promise<Cart> {
  return apiFetch<Cart>('/cart');
}

/** POST /cart — buyer only; add item to cart */
export async function addToCart(listing_id: number): Promise<Cart> {
  return apiFetch<Cart>('/cart', {
    method: 'POST',
    body: JSON.stringify({ listing_id }),
  });
}

/** DELETE /cart/:listing_id — buyer only; remove item from cart */
export async function removeFromCart(listing_id: number): Promise<Cart> {
  return apiFetch<Cart>(`/cart/${listing_id}`, {
    method: 'DELETE',
  });
}
