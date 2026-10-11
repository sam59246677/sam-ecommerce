import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, OrderStatus } from "../types/order";

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => boolean;
  updateOrderStatus: (
    orderId: number,
    status: OrderStatus
  ) => void;
  cancelOrder: (orderId: number, userId: number) => void;
  clearOrders: () => void;
}

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (order) => {
        // Prevent duplicate order IDs.
        const alreadyExists = get().orders.some(
          (existingOrder) => existingOrder.id === order.id
        );

        if (alreadyExists) {
          return false;
        }

        set((state) => ({
          orders: [...state.orders, order],
        }));

        return true;
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) {
              return order;
            }

            const allowedStatuses = allowedTransitions[order.status];

            if (!allowedStatuses.includes(status)) {
              return order;
            }

            return {
              ...order,
              status,
            };
          }),
        }));
      },

      cancelOrder: (orderId, userId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId &&
            order.userId === userId &&
            order.status === "pending"
              ? { ...order, status: "cancelled" }
              : order
          ),
        }));
      },

      clearOrders: () => {
        set({ orders: [] });
      },
    }),
    {
      name: "order-storage",
    }
  )
);

export default useOrderStore;