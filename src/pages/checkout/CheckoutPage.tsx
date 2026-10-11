import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import useCartStore from "../../store/cartStore";
import useOrderStore from "../../store/orderStore";
import useAuthStore from "../../store/authStore";

const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters"),

  address: z
    .string()
    .trim()
    .min(10, "Address must be at least 10 characters"),

  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters"),

  postalCode: z
    .string()
    .trim()
    .min(5, "Postal code must be at least 5 characters"),

  phone: z
    .string()
    .trim()
    .regex(
      /^\+?[\d\s()-]+$/,
      "Please enter a valid phone number"
    )
    .refine(
      (value) => value.replace(/\D/g, "").length >= 10,
      "Phone number must contain at least 10 digits"
    ),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

function CheckoutPage() {
  const navigate = useNavigate();

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const addOrder = useOrderStore((state) => state.addOrder);
  const user = useAuthStore((state) => state.user);

  const [submitError, setSubmitError] = useState("");
  const isProcessingRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: "onBlur",
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + shipping;

  const onSubmit = async (data: CheckoutFormData) => {
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    setSubmitError("");

    try {
      if (items.length === 0) {
        setSubmitError("Your cart is empty.");
        return;
      }

      if (!user) {
        setSubmitError("Please log in before placing your order.");
        return;
      }

      const hasInvalidQuantity = items.some(
        (item) =>
          !Number.isInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > item.product.stock
      );

      if (hasInvalidQuantity) {
        setSubmitError(
          "Some product quantities are no longer available. Please review your cart."
        );
        return;
      }

      const order = {
        id: Date.now(),
        userId: user.id,

        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),

        shippingAddress: data,
        total,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      };

      const orderAdded = addOrder(order);

      if (!orderAdded) {
        setSubmitError(
          "This order could not be created. Please try again."
        );
        return;
      }

      clearCart();

      navigate("/orders", {
        state: { orderPlaced: true },
      });
    } catch (error) {
      console.error("Failed to create order:", error);

      setSubmitError(
        "Something went wrong while placing your order. Please try again."
      );
    } finally {
      isProcessingRef.current = false;
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border px-4 py-3 outline-none transition focus-visible:ring-2 ${
      hasError
        ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-100"
        : "border-[var(--color-border)] focus-visible:border-[var(--color-primary)] focus-visible:ring-blue-100"
    }`;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-[var(--color-border)] bg-white p-10 text-center shadow-sm">
          <div
            aria-hidden="true"
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-3xl"
          >
            🛒
          </div>

          <h1 className="mt-6 text-3xl font-bold text-[var(--color-text)]">
            Your Cart is Empty
          </h1>

          <p className="mt-3 text-[var(--color-text-muted)]">
            Add some products before proceeding to checkout.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex rounded-xl bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="border-b border-[var(--color-border)] pb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
          Checkout
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-[var(--color-text)]">
          Complete Your Order
        </h1>

        <p className="mt-2 text-[var(--color-text-muted)]">
          Enter your shipping information to place your order.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-8 grid gap-8 lg:grid-cols-3"
      >
        <section
          aria-labelledby="shipping-heading"
          className="lg:col-span-2"
        >
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
            <h2
              id="shipping-heading"
              className="text-xl font-bold text-[var(--color-text)]"
            >
              Shipping Information
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Please provide your delivery information.
            </p>

            {submitError && (
              <p
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {submitError}
              </p>
            )}

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={
                    errors.fullName ? "fullName-error" : undefined
                  }
                  placeholder="John Doe"
                  {...register("fullName")}
                  className={inputClass(Boolean(errors.fullName))}
                />

                {errors.fullName && (
                  <p
                    id="fullName-error"
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                >
                  Address
                </label>

                <input
                  id="address"
                  type="text"
                  autoComplete="street-address"
                  aria-invalid={Boolean(errors.address)}
                  aria-describedby={
                    errors.address ? "address-error" : undefined
                  }
                  placeholder="123 Main Street"
                  {...register("address")}
                  className={inputClass(Boolean(errors.address))}
                />

                {errors.address && (
                  <p
                    id="address-error"
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                >
                  City
                </label>

                <input
                  id="city"
                  type="text"
                  autoComplete="address-level2"
                  aria-invalid={Boolean(errors.city)}
                  aria-describedby={
                    errors.city ? "city-error" : undefined
                  }
                  placeholder="New York"
                  {...register("city")}
                  className={inputClass(Boolean(errors.city))}
                />

                {errors.city && (
                  <p
                    id="city-error"
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                >
                  Postal Code
                </label>

                <input
                  id="postalCode"
                  type="text"
                  autoComplete="postal-code"
                  aria-invalid={Boolean(errors.postalCode)}
                  aria-describedby={
                    errors.postalCode ? "postalCode-error" : undefined
                  }
                  placeholder="10001"
                  {...register("postalCode")}
                  className={inputClass(Boolean(errors.postalCode))}
                />

                {errors.postalCode && (
                  <p
                    id="postalCode-error"
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.postalCode.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={
                    errors.phone ? "phone-error" : undefined
                  }
                  placeholder="+1 555 123 4567"
                  {...register("phone")}
                  className={inputClass(Boolean(errors.phone))}
                />

                {errors.phone && (
                  <p
                    id="phone-error"
                    className="mt-2 text-sm text-red-600"
                  >
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold text-[var(--color-text)]">
                    {item.product.name}
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    ${item.product.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>

                <p className="text-sm font-semibold text-[var(--color-text)]">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4 border-t border-[var(--color-border)] pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">
                Subtotal
              </span>

              <span className="font-semibold text-[var(--color-text)]">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">
                Shipping
              </span>

              <span className="font-semibold text-[var(--color-text)]">
                {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
              </span>
            </div>

            <div className="border-t border-[var(--color-border)] pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--color-text)]">
                  Total
                </span>

                <span className="text-2xl font-bold text-[var(--color-text)]">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-xl bg-[var(--color-primary)] px-5 py-3.5 font-semibold text-white transition hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>

          <Link
            to="/cart"
            className="mt-3 block text-center text-sm font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            ← Back to Cart
          </Link>

          <p className="mt-5 text-center text-xs leading-5 text-[var(--color-text-muted)]">
            By placing your order, you agree to our terms and conditions.
          </p>
        </aside>
      </form>
    </main>
  );
}

export default CheckoutPage;