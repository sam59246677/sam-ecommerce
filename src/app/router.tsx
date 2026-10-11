import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "./MainLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import RoleRoute from "../components/auth/RoleRoute";

// بارگذاری تنبل صفحات
const ProductsPage = lazy(
  () => import("../pages/products/ProductsPage")
);

const ProductDetailsPage = lazy(
  () => import("../pages/product-details/ProductDetailsPage")
);

const CartPage = lazy(() => import("../pages/cart/CartPage"));

const CheckoutPage = lazy(
  () => import("../pages/checkout/CheckoutPage")
);

const OrdersPage = lazy(() => import("../pages/orders/OrdersPage"));

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));

const AdminDashboardPage = lazy(
  () => import("../pages/admin/AdminDashboardPage")
);

const AdminProductsPage = lazy(
  () => import("../pages/admin/AdminProductsPage")
);

const AdminOrdersPage = lazy(
  () => import("../pages/admin/AdminOrdersPage")
);

const RegisterPage = lazy(
  () => import("../pages/auth/RegisterPage")
);

// نمایش پیام هنگام بارگذاری هر صفحه
function withSuspense(element: ReactNode) {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-64 items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-gray-500">
            Loading page...
          </p>
        </div>
      }
    >
      {element}
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },

      {
        path: "products",
        element: withSuspense(<ProductsPage />),
      },

      {
        path: "products/:id",
        element: withSuspense(<ProductDetailsPage />),
      },

      {
        path: "cart",
        element: withSuspense(<CartPage />),
      },

      {
        path: "checkout",
        element: (
          <ProtectedRoute>
            {withSuspense(<CheckoutPage />)}
          </ProtectedRoute>
        ),
      },

      {
        path: "orders",
        element: (
          <ProtectedRoute>
            {withSuspense(<OrdersPage />)}
          </ProtectedRoute>
        ),
      },

      {
        path: "login",
        element: withSuspense(<LoginPage />),
      },

      {
        path: "admin",
        element: (
          <RoleRoute allowedRole="admin">
            {withSuspense(<AdminDashboardPage />)}
          </RoleRoute>
        ),
      },

      {
        path: "admin/products",
        element: (
          <RoleRoute allowedRole="admin">
            {withSuspense(<AdminProductsPage />)}
          </RoleRoute>
        ),
      },

      {
        path: "admin/orders",
        element: (
          <RoleRoute allowedRole="admin">
            {withSuspense(<AdminOrdersPage />)}
          </RoleRoute>
        ),
      },

      {
        path: "register",
        element: withSuspense(<RegisterPage />),
      },
    ],
  },
]);

export default router;