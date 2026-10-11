
import { apiFetch } from "./api";
import type { Order } from "../types/order";

export async function createOrder(
  order: Order
): Promise<Order> {
  return apiFetch<Order>("/carts/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });
}
