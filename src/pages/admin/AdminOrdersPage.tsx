
import { useEffect, useMemo, useState } from "react";

import useOrderStore from "../../store/orderStore";
import type { Order, OrderStatus } from "../../types/order";

const statusOptions: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

function AdminOrdersPage() {
  const orders = useOrderStore((state) => state.orders);
  const updateOrderStatus = useOrderStore(
    (state) => state.updateOrderStatus
  );

  const [statusFilter, setStatusFilter] = useState<
    OrderStatus | "all"
  >("all");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return orders
      .filter((order) => {
        const matchesStatus =
          statusFilter === "all" || order.status === statusFilter;

        const matchesSearch =
          query === "" ||
          String(order.id).includes(query) ||
          order.shippingAddress.fullName
            .toLowerCase()
            .includes(query);

        return matchesStatus && matchesSearch;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [orders, statusFilter, searchTerm]);

  // Keep the modal synchronized with status changes in the store.
  const currentSelectedOrder = selectedOrder
    ? orders.find((order) => order.id === selectedOrder.id) ?? null
    : null;

  useEffect(() => {
    if (!currentSelectedOrder && selectedOrder) {
      setSelectedOrder(null);
    }
  }, [currentSelectedOrder, selectedOrder]);

  // Close the modal with the Escape key.
  useEffect(() => {
    if (!currentSelectedOrder) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedOrder(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSelectedOrder]);

  const formatStatus = (status: OrderStatus) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  const getStatusStyles = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const totalRevenue = orders.reduce(
    (total, order) =>
      order.status === "cancelled" ? total : total + order.total,
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* Page heading */}
      <div className="border-b border-[var(--color-border)] pb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
          Store Management
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl">
          Manage Orders
        </h1>

        <p className="mt-2 text-[var(--color-text-muted)]">
          Review customer orders and update their status.
        </p>
      </div>

      {/* Summary cards */}
      <section
        aria-label="Order statistics"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            Total Orders
          </p>

          <p className="mt-3 text-3xl font-bold text-[var(--color-text)]">
            {orders.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            Pending Orders
          </p>

          <p className="mt-3 text-3xl font-bold text-amber-600">
            {pendingOrders}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            Order Value
          </p>

          <p className="mt-3 text-3xl font-bold text-[var(--color-text)]">
            {totalRevenue.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>

          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Excludes cancelled orders
          </p>
        </div>
      </section>

      {/* Orders and filters */}
      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              All Orders
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"} found
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="order-search"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                Search orders
              </label>

              <input
                id="order-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Order number or customer..."
                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] outline-none placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 sm:w-64"
              />
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                Filter by status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as OrderStatus | "all"
                  )
                }
                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 sm:w-44"
              >
                <option value="all">All statuses</option>

                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-4 font-semibold">Order</th>
                <th className="px-4 py-4 font-semibold">Customer</th>
                <th className="px-4 py-4 font-semibold">Date</th>
                <th className="px-4 py-4 font-semibold">Total</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">
                  Update Status
                </th>
                <th className="px-4 py-4 font-semibold">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[var(--color-text-muted)]"
                  >
                    {orders.length === 0
                      ? "No orders have been placed yet."
                      : "No orders match your search or filter."}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition hover:bg-gray-50/70"
                  >
                    <td className="px-4 py-4">
                      <span className="font-semibold text-[var(--color-text)]">
                        #{order.id}
                      </span>

                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "product" : "products"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-semibold text-[var(--color-text)]">
                        {order.shippingAddress.fullName}
                      </p>

                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                        Customer ID: {order.userId}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-[var(--color-text-muted)]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-[var(--color-text)]">
                      ${order.total.toFixed(2)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyles(
                          order.status
                        )}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <select
                        aria-label={`Update status for order ${order.id}`}
                        value={order.status}
                        onChange={(event) =>
                          updateOrderStatus(
                            order.id,
                            event.target.value as OrderStatus
                          )
                        }
                        className="w-36 rounded-lg border border-[var(--color-border)] bg-white px-2 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100"
                      >
                        <option value={order.status}>
                          {formatStatus(order.status)}
                        </option>

                        {allowedTransitions[order.status].map((status) => (
                          <option key={status} value={status}>
                            {formatStatus(status)}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="whitespace-nowrap rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-blue-50"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Order details modal */}
      {currentSelectedOrder && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-white p-5 sm:p-6">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Order Details
                </p>

                <h2
                  id="order-details-title"
                  className="mt-1 text-xl font-bold text-[var(--color-text)]"
                >
                  Order #{currentSelectedOrder.id}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close order details"
                onClick={() => setSelectedOrder(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl text-[var(--color-text-muted)] transition hover:bg-gray-100 hover:text-[var(--color-text)]"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* Order summary */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Order Date
                  </p>

                  <p className="mt-1 font-semibold text-[var(--color-text)]">
                    {new Date(
                      currentSelectedOrder.createdAt
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Order Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(
                      currentSelectedOrder.status
                    )}`}
                  >
                    {formatStatus(currentSelectedOrder.status)}
                  </span>
                </div>
              </div>

              {/* Customer and shipping details */}
              <div>
                <h3 className="font-bold text-[var(--color-text)]">
                  Customer & Shipping
                </h3>

                <div className="mt-3 rounded-xl border border-[var(--color-border)] p-4 text-sm">
                  <p className="font-semibold text-[var(--color-text)]">
                    {currentSelectedOrder.shippingAddress.fullName}
                  </p>

                  <p className="mt-2 text-[var(--color-text-muted)]">
                    Customer ID: {currentSelectedOrder.userId}
                  </p>

                  <p className="mt-3 text-[var(--color-text-muted)]">
                    {currentSelectedOrder.shippingAddress.address}
                  </p>

                  <p className="mt-1 text-[var(--color-text-muted)]">
                    {currentSelectedOrder.shippingAddress.city},{" "}
                    {currentSelectedOrder.shippingAddress.postalCode}
                  </p>

                  <p className="mt-1 text-[var(--color-text-muted)]">
                    Phone: {currentSelectedOrder.shippingAddress.phone}
                  </p>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="font-bold text-[var(--color-text)]">
                  Ordered Products
                </h3>

                <div className="mt-3 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] px-4">
                  {currentSelectedOrder.items.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex items-start justify-between gap-4 py-4"
                    >
                      <div>
                        <p className="font-semibold text-[var(--color-text)]">
                          {item.productName}
                        </p>

                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 font-semibold text-[var(--color-text)]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-5">
                <span className="font-semibold text-[var(--color-text-muted)]">
                  Order Total
                </span>

                <span className="text-2xl font-bold text-[var(--color-text)]">
                  ${currentSelectedOrder.total.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
                >
                  Close Details
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
export default AdminOrdersPage;