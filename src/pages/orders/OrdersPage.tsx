import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import useOrderStore from "../../store/orderStore";
import useAuthStore from "../../store/authStore";
import type { OrderStatus } from "../../types/order";

function OrdersPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const orders = useOrderStore((state) => state.orders);
  const cancelOrder = useOrderStore((state) => state.cancelOrder);
  const user = useAuthStore((state) => state.user);

  const [message, setMessage] = useState("");

  const orderPlaced = location.state?.orderPlaced === true;
  const [showOrderPlaced, setShowOrderPlaced] = useState(orderPlaced);

  // Clear the navigation state so refreshing the page
  // does not show the success message again.
  useEffect(() => {
    if (orderPlaced) {
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, [orderPlaced, navigate, location.pathname]);

  // Show only the current user's orders.
  // Administrators can see all orders.
  const visibleOrders = (
    user?.role === "admin"
      ? orders
      : orders.filter((order) => order.userId === user?.id)
  ).slice().sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  const handleCancelOrder = (orderId: number) => {
    if (!user || user.role === "admin") {
      return;
    }

    const order = visibleOrders.find(
      (item) => item.id === orderId
    );

    if (!order || order.status !== "pending") {
      setMessage("This order can no longer be cancelled.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel order #${orderId}?`
    );

    if (!confirmed) {
      return;
    }

    cancelOrder(orderId, user.id);

    setMessage(`Order #${orderId} has been cancelled successfully.`);
  };

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

  // Handle an unexpected visit without authentication.
  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          Please Log In
        </h1>

        <p className="mt-3 text-[var(--color-text-muted)]">
          You need to log in to view your orders.
        </p>

        <Link
          to="/login"
          state={{ from: location }}
          className="mt-8 inline-flex rounded-xl bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
        >
          Log In
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {showOrderPlaced && (
        <div
          role="status"
          className="mb-8 flex items-start justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">
              ✓
            </span>

            <div>
              <h2 className="font-bold">
                Order placed successfully!
              </h2>

              <p className="mt-1 text-sm">
                Your order has been placed and is awaiting processing.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowOrderPlaced(false)}
            aria-label="Dismiss success message"
            className="shrink-0 font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {message && (
        <div
          role="status"
          className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"
        >
          <p>{message}</p>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
            className="shrink-0 font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {visibleOrders.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-2xl border border-[var(--color-border)] bg-white p-10 text-center shadow-sm">
          <div
            aria-hidden="true"
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-3xl"
          >
            📦
          </div>

          <h1 className="mt-6 text-3xl font-bold text-[var(--color-text)]">
            No Orders Yet
          </h1>

          <p className="mt-3 text-[var(--color-text-muted)]">
            You haven't placed any orders yet. Start shopping and your
            orders will appear here.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex rounded-xl bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="border-b border-[var(--color-border)] pb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              Order History
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)]">
                  {user.role === "admin" ? "All Orders" : "My Orders"}
                </h1>

                <p className="mt-2 text-[var(--color-text-muted)]">
                  {user.role === "admin"
                    ? "Manage and review all customer orders."
                    : "Track and review your previous orders."}
                </p>
              </div>

              <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
                {visibleOrders.length}{" "}
                {visibleOrders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {visibleOrders.map((order) => (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="border-b border-[var(--color-border)] bg-gray-50/70 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Order Number
                      </p>

                      <h2 className="mt-1 text-lg font-bold text-[var(--color-text)]">
                        #{order.id}
                      </h2>

                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>

                      {user.role === "admin" && (
                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          Customer ID: {order.userId}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`w-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusStyles(order.status)}`}
                      >
                        {order.status}
                      </span>

                      {user.role !== "admin" &&
                        order.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order.id)}
                            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                          >
                            Cancel Order
                          </button>
                        )}
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {order.status === "cancelled" && (
                    <div
                      role="status"
                      className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                      <p className="font-semibold">
                        This order has been cancelled.
                      </p>

                      <p className="mt-1">
                        If you need help with this order, please contact
                        support.
                      </p>
                    </div>
                  )}

                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                    Products
                  </h3>

                  <div className="mt-4 divide-y divide-[var(--color-border)]">
                    {order.items.map((item, index) => (
                      <div
                        key={`${item.productId}-${index}`}
                        className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
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

                  <div className="mt-6 grid gap-6 border-t border-[var(--color-border)] pt-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Shipping Address
                      </h3>

                      <div className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                        <p className="font-semibold text-[var(--color-text)]">
                          {order.shippingAddress.fullName}
                        </p>

                        <p>{order.shippingAddress.address}</p>

                        <p>
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.postalCode}
                        </p>

                        <p>{order.shippingAddress.phone}</p>
                      </div>
                    </div>

                    <div className="md:text-right">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        Order Total
                      </h3>

                      <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
                        ${order.total.toFixed(2)}
                      </p>

                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        Including shipping
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 text-center">
        <Link
          to="/products"
          className="text-sm font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-hover)]"
        >
          ← Continue Shopping
        </Link>
      </div>
    </main>
  );
}

export default OrdersPage;