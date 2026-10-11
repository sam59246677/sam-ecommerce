
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../types/product";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  activeUserKey: string;
  cartsByUser: Record<string, CartItem[]>;
  items: CartItem[];

  setUserCart: (userId: number | null) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  clearCart: () => void;
}

const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      activeUserKey: "guest",
      cartsByUser: {},
      items: [],

      setUserCart: (userId) => {
        const key = userId === null ? "guest" : String(userId);

        set((state) => ({
          activeUserKey: key,
          items: state.cartsByUser[key] ?? [],
        }));
      },

      addToCart: (product, quantity = 1) => {
        const requestedQuantity = Math.floor(quantity);

        if (
          !Number.isFinite(requestedQuantity) ||
          requestedQuantity < 1 ||
          product.stock <= 0
        ) {
          return;
        }

        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          const currentQuantity = existingItem?.quantity ?? 0;

          const allowedQuantity = Math.min(
            requestedQuantity,
            Math.max(0, product.stock - currentQuantity)
          );

          if (allowedQuantity === 0) {
            return state;
          }

          const items = existingItem
            ? state.items.map((item) =>
                item.product.id === product.id
                  ? {
                      ...item,
                      product,
                      quantity: item.quantity + allowedQuantity,
                    }
                  : item
              )
            : [
                ...state.items,
                {
                  product,
                  quantity: allowedQuantity,
                },
              ];

          return {
            items,
            cartsByUser: {
              ...state.cartsByUser,
              [state.activeUserKey]: items,
            },
          };
        });
      },

      removeFromCart: (productId) => {
        set((state) => {
          const items = state.items.filter(
            (item) => item.product.id !== productId
          );

          return {
            items,
            cartsByUser: {
              ...state.cartsByUser,
              [state.activeUserKey]: items,
            },
          };
        });
      },

      increaseQuantity: (productId) => {
        set((state) => {
          const items = state.items.map((item) =>
            item.product.id === productId &&
            item.quantity < item.product.stock
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );

          return {
            items,
            cartsByUser: {
              ...state.cartsByUser,
              [state.activeUserKey]: items,
            },
          };
        });
      },

      decreaseQuantity: (productId) => {
        set((state) => {
          const items = state.items
            .map((item) =>
              item.product.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0);

          return {
            items,
            cartsByUser: {
              ...state.cartsByUser,
              [state.activeUserKey]: items,
            },
          };
        });
      },

      clearCart: () => {
        set((state) => ({
          items: [],
          cartsByUser: {
            ...state.cartsByUser,
            [state.activeUserKey]: [],
          },
        }));
      },
    }),
    {
      name: "cart-storage",
    }
  )
);

export default useCartStore;
