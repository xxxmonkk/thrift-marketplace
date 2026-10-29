import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Cart, CartItem } from '../types/api';
import { getCart, addToCart, removeFromCart } from '../api/cart';
import { useAuth } from './AuthContext';
import mockListings from '../mockData';

// ── Types ─────────────────────────────────────────────────
interface CartContextValue {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (listing_id: number) => Promise<void>;
  removeItem: (listing_id: number) => Promise<void>;
  hasSoldItems: boolean;
  soldItems: CartItem[];
}

const CART_STORAGE_KEY = 'salixir_cart';

function getStoredCart(): Cart {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { items: [], total: 0 };
}

function saveStoredCart(cart: Cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {}
}

// ── Context ───────────────────────────────────────────────
const CartContext = createContext<CartContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isRole } = useAuth();
  const [cart, setCart] = useState<Cart>(getStoredCart);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state to localStorage whenever cart changes
  useEffect(() => {
    saveStoredCart(cart);
  }, [cart]);

  const fetchCart = useCallback(async () => {
    // If user is authenticated buyer, attempt sync with server
    if (isAuthenticated && isRole('buyer')) {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCart();
        setCart(data);
      } catch (err: any) {
        // If server is unreachable or offline, keep local cart
        console.warn('Backend cart sync unavailable, using local cart:', err.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, isRole]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async (listing_id: number) => {
      setIsLoading(true);
      setError(null);

      // If user is authenticated as buyer, try backend first
      if (isAuthenticated && isRole('buyer')) {
        try {
          const updated = await addToCart(listing_id);
          setCart(updated);
          setIsLoading(false);
          return;
        } catch (err: any) {
          // If error is 409 (item sold) or 400 (validation), re-throw
          if (err?.status === 409 || err?.status === 400) {
            setIsLoading(false);
            throw err;
          }
          // Otherwise server is offline, fall through to local cart
          console.warn('Backend cart unavailable, adding to local cart');
        }
      }

      // Local cart fallback
      setCart((prev) => {
        const exists = prev.items.some((i) => i.listing_id === listing_id);
        if (exists) return prev; // Avoid duplicate

        // Find product info from mock data or default
        const prod = mockListings.find((m) => m.id === listing_id);
        const newItem: CartItem = {
          listing_id,
          title: prod?.title ?? `Vintage Item #${listing_id}`,
          price: prod?.price ?? 1500,
          status: prod?.status ?? 'live',
          image_url: prod?.image_url ?? null,
        };

        const updatedItems = [...prev.items, newItem];
        const updatedTotal = updatedItems
          .filter((i) => i.status === 'live')
          .reduce((sum, i) => sum + i.price, 0);

        return { items: updatedItems, total: updatedTotal };
      });
      setIsLoading(false);
    },
    [isAuthenticated, isRole]
  );

  const removeItem = useCallback(
    async (listing_id: number) => {
      setIsLoading(true);
      setError(null);

      if (isAuthenticated && isRole('buyer')) {
        try {
          const updated = await removeFromCart(listing_id);
          setCart(updated);
          setIsLoading(false);
          return;
        } catch (err) {
          console.warn('Backend remove failed, removing locally');
        }
      }

      // Local removal
      setCart((prev) => {
        const updatedItems = prev.items.filter((i) => i.listing_id !== listing_id);
        const updatedTotal = updatedItems
          .filter((i) => i.status === 'live')
          .reduce((sum, i) => sum + i.price, 0);

        return { items: updatedItems, total: updatedTotal };
      });
      setIsLoading(false);
    },
    [isAuthenticated, isRole]
  );

  const soldItems = useMemo(
    () => cart.items.filter((i) => i.status === 'sold'),
    [cart]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount: cart.items.filter((i) => i.status === 'live').length,
      isLoading,
      error,
      fetchCart,
      addItem,
      removeItem,
      hasSoldItems: soldItems.length > 0,
      soldItems,
    }),
    [cart, isLoading, error, fetchCart, addItem, removeItem, soldItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
