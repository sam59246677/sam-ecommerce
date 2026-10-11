import { useQuery } from "@tanstack/react-query";
import useAuthStore from "../../store/authStore";
import useOrderStore from "../../store/orderStore";
import { getProducts } from "../../services/productService";
import { getStoredAdminProducts } from "../../services/adminProductStorage";

function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const orders = useOrderStore((state) => state.orders);

  const { data, isPending, isError } = useQuery({
    queryKey: ["admin-dashboard-products"],
    queryFn: () => getProducts(1, 100),
  });

  const storedProducts = getStoredAdminProducts();
  const totalProducts = storedProducts?.length ?? data?.total ?? 0;
  const totalOrders = orders.length;

  const totalRevenue = orders.reduce((total, order) => {
    const orderTotal = order.items.reduce(
      (itemTotal, item) =>
        itemTotal + item.price * item.quantity,
      0
    );

    return total + orderTotal;
  }, 0);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-[var(--color-border)] pb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
          Administration
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-[var(--color-text)]">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-[var(--color-text-muted)]">
          Welcome back, {user?.name}.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--color-text-muted)]">
            Total Products
          </p>

          <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
            {isPending
              ? "..."
              : isError
                ? "—"
                : totalProducts}
          </p>

          {isError && (
            <p className="mt-2 text-xs text-red-600">
              Could not load products.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--color-text-muted)]">
            Total Orders
          </p>

          <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
            {totalOrders}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--color-text-muted)]">
            Customers
          </p>

          <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
            —
          </p>

          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Customer statistics are not available yet.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm text-[var(--color-text-muted)]">
            Revenue
          </p>

          <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
            {totalRevenue.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
        </div>
      </div>
    </main>
  );
}
export default AdminDashboardPage;