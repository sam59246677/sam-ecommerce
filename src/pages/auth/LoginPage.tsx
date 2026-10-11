
import { useState } from "react";
import type { FormEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import useAuthStore from "../../store/authStore";
import useCartStore from "../../store/cartStore";

interface LoginLocationState {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const authenticate = useAuthStore(
    (state) => state.authenticate
  );

  const setUserCart = useCartStore(
    (state) => state.setUserCart
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    const user = authenticate(normalizedEmail, password);

    if (!user) {
      setError("Invalid email or password.");
      return;
    }

    // Load this user's own shopping cart.
    setUserCart(user.id);

    const state = location.state as LoginLocationState | null;
    const from = state?.from;

    const pathname = from?.pathname;

    // Only allow internal application paths.
    const isValidPath =
      typeof pathname === "string" &&
      pathname.startsWith("/") &&
      !pathname.startsWith("//");

    const redirectPath = isValidPath
      ? `${pathname}${from?.search ?? ""}${from?.hash ?? ""}`
      : "/products";

    navigate(redirectPath, {
      replace: true,
    });
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--color-background)] px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <Link
            to="/products"
            className="text-2xl font-bold text-[var(--color-text)]"
          >
            MyShop
          </Link>

          <h1 className="mt-8 text-3xl font-bold tracking-tight text-[var(--color-text)]">
            Welcome back
          </h1>

          <p className="mt-2 text-[var(--color-text-muted)]">
            Sign in to continue shopping.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-error" : undefined}
                className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-error" : undefined}
                className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <div
                id="login-error"
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--color-primary)] px-5 py-3.5 font-semibold text-white transition hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Demo Admin
            </p>

            <p className="mt-2 text-sm text-[var(--color-text)]">
              admin@example.com
            </p>

            <p className="text-sm text-[var(--color-text-muted)]">
              Password: admin123
            </p>

            <div className="my-3 border-t border-gray-200" />

            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Demo Customer
            </p>

            <p className="mt-2 text-sm text-[var(--color-text)]">
              customer@example.com
            </p>

            <p className="text-sm text-[var(--color-text-muted)]">
              Password: customer123
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
            >
              Create account
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/products"
            className="text-sm font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]"
          >
            ← Continue as guest
          </Link>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
