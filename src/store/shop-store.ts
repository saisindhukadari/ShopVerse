import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/lib/mock-data";

export interface CartItem {
  product: Product;
  quantity: number;
  savedForLater?: boolean;
}

interface ShopState {
  cart: CartItem[];
  wishlist: string[]; // product ids
  recentSearches: string[];
  addToCart: (p: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  saveForLater: (id: string) => void;
  moveToCart: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  moveWishlistToCart: (p: Product) => void;
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      recentSearches: [],
      addToCart: (product, qty = 1) =>
        set((s) => {
          const existing = s.cart.find(
            (i) => i.product.id === product.id && !i.savedForLater,
          );
          if (existing) {
            return {
              cart: s.cart.map((i) =>
                i.product.id === product.id && !i.savedForLater
                  ? { ...i, quantity: i.quantity + qty }
                  : i,
              ),
            };
          }
          return { cart: [...s.cart, { product, quantity: qty }] };
        }),
      removeFromCart: (id) =>
        set((s) => ({ cart: s.cart.filter((i) => i.product.id !== id) })),
      updateQty: (id, qty) =>
        set((s) => ({
          cart: s.cart
            .map((i) =>
              i.product.id === id ? { ...i, quantity: Math.max(0, qty) } : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      saveForLater: (id) =>
        set((s) => ({
          cart: s.cart.map((i) =>
            i.product.id === id ? { ...i, savedForLater: true } : i,
          ),
        })),
      moveToCart: (id) =>
        set((s) => ({
          cart: s.cart.map((i) =>
            i.product.id === id ? { ...i, savedForLater: false } : i,
          ),
        })),
      clearCart: () => set({ cart: [] }),
      toggleWishlist: (id) =>
        set((s) => ({
          wishlist: s.wishlist.includes(id)
            ? s.wishlist.filter((w) => w !== id)
            : [...s.wishlist, id],
        })),
      isInWishlist: (id) => get().wishlist.includes(id),
      moveWishlistToCart: (p) => {
        get().addToCart(p, 1);
        set((s) => ({ wishlist: s.wishlist.filter((w) => w !== p.id) }));
      },
      addRecentSearch: (q) =>
        set((s) => {
          const t = q.trim();
          if (!t) return s;
          return {
            recentSearches: [t, ...s.recentSearches.filter((x) => x !== t)].slice(
              0,
              6,
            ),
          };
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "shop-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : (undefined as unknown as Storage),
      ),
      partialize: (s) => ({
        cart: s.cart,
        wishlist: s.wishlist,
        recentSearches: s.recentSearches,
      }),
    },
  ),
);

export const cartCount = (s: ShopState) =>
  s.cart.filter((i) => !i.savedForLater).reduce((sum, i) => sum + i.quantity, 0);

export const cartSubtotal = (s: ShopState) =>
  s.cart
    .filter((i) => !i.savedForLater)
    .reduce((sum, i) => sum + i.product.price * i.quantity, 0);
