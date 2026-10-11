
import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const adminMenuRef = useRef<HTMLDivElement>(null);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const items = useCartStore((state) => state.items);
  const setUserCart = useCartStore((state) => state.setUserCart);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );
  const logout = useAuthStore((state) => state.logout);

  const isAdmin = isAuthenticated && user?.role === "admin";

  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleLogout = () => {
    setUserCart(null);
    logout();
    setIsAdminMenuOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    setUserCart(isAuthenticated && user ? user.id : null);
  }, [isAuthenticated, user?.id, setUserCart]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(event.target as Node)
      ) {
        setIsAdminMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsAdminMenuOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap text-sm font-medium transition-colors ${
      isActive
        ? "text-blue-600"
        : "text-gray-600 hover:text-gray-900"
    }`;

  const adminLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-4 py-2.5 text-sm transition-colors ${
      isActive
        ? "bg-blue-50 font-semibold text-blue-600"
        : "text-gray-700 hover:bg-gray-50"
    }`;

  const cartLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-blue-50 text-blue-600"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-3 sm:px-5 lg:flex-row lg:items-center lg:gap-6 lg:px-8">

        {/* لوگو و ورود / خروج */}
        <div className="flex min-h-16 w-full min-w-0 flex-col items-center justify-center gap-3 py-3 sm:flex-row sm:justify-between sm:gap-4 sm:py-0 lg:w-auto lg:shrink-0 lg:gap-5">
          <Link
            to="/products"
            className="shrink-0 text-center text-lg font-bold tracking-tight text-gray-900 sm:text-left sm:text-xl"
          >
            MyShop
          </Link>

          <div className="flex min-w-0 shrink-0 items-center justify-center gap-2">
            {isAuthenticated && user && (
              <div className="hidden min-w-0 text-right sm:block">
                <p className="max-w-36 truncate text-sm font-semibold text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs capitalize text-gray-500">
                  {user.role}
                </p>
              </div>
            )}

            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-4"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* لینک‌های اصلی */}
        <nav
          aria-label="Main navigation"
          className="flex min-h-12 w-full min-w-0 items-center justify-center border-t border-gray-100 lg:min-h-16 lg:flex-1 lg:border-t-0"
        >
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-4 gap-y-3 py-3 sm:gap-x-6 sm:py-0 lg:flex-nowrap lg:gap-x-5">
            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/orders" className={navLinkClass}>
                <span className="sm:hidden">Orders</span>
                <span className="hidden sm:inline">My Orders</span>
              </NavLink>
            )}

            {isAdmin && (
              <div ref={adminMenuRef} className="relative shrink-0">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isAdminMenuOpen}
                  onClick={() =>
                    setIsAdminMenuOpen((current) => !current)
                  }
                  className={`flex items-center gap-1 whitespace-nowrap py-1 text-sm font-medium transition-colors ${
                    isAdminMenuOpen ||
                    location.pathname.startsWith("/admin")
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Admin

                  <svg
                    aria-hidden="true"
                    className={`h-4 w-4 transition-transform ${
                      isAdminMenuOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="m5 7.5 5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isAdminMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Admin menu"
                    className="absolute left-1/2 top-full z-50 mt-2 w-52 max-w-[calc(100vw-24px)] -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-2 shadow-lg sm:left-0 sm:translate-x-0"
                  >
                    <NavLink
                      to="/admin"
                      end
                      role="menuitem"
                      onClick={() => setIsAdminMenuOpen(false)}
                      className={adminLinkClass}
                    >
                      Dashboard
                    </NavLink>

                    <NavLink
                      to="/admin/products"
                      role="menuitem"
                      onClick={() => setIsAdminMenuOpen(false)}
                      className={adminLinkClass}
                    >
                      Manage Products
                    </NavLink>

                    <NavLink
                      to="/admin/orders"
                      role="menuitem"
                      onClick={() => setIsAdminMenuOpen(false)}
                      className={adminLinkClass}
                    >
                      Manage Orders
                    </NavLink>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* سبد خرید در موبایل و تبلت */}
        <div className="flex w-full min-w-0 items-center justify-center border-t border-gray-100 py-2 lg:hidden">
          <NavLink
            to="/cart"
            aria-label={`Shopping cart, ${cartCount} items`}
            className={cartLinkClass}
          >
            <span aria-hidden="true">🛒</span>
            <span>Cart ({cartCount})</span>
          </NavLink>
        </div>

        {/* سبد خرید دسکتاپ؛ همان ردیف اصلی */}
        <div className="hidden shrink-0 items-center lg:flex">
          <NavLink
            to="/cart"
            aria-label={`Shopping cart, ${cartCount} items`}
            className={cartLinkClass}
          >
            <span aria-hidden="true">🛒</span>
            <span>Cart ({cartCount})</span>
          </NavLink>
        </div>

      </div>
    </header>
  );
}

export default Header;
