import { apiFetch } from './client';
import type { Order, CheckoutPayload } from '../types/api';

/** POST /orders — buyer checkout; checks out the buyer's cart */
export async function createOrder(payload: CheckoutPayload): Promise<Order> {
  return apiFetch<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** GET /orders/mine — buyer only; returns order history */
export async function getMyOrders(): Promise<Order[]> {
  return apiFetch<Order[]>('/orders/mine');
}
