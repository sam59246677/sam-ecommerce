
import { Link } from "react-router-dom";
import useCartStore from "../../store/cartStore";

function CartPage() {
  const items = useCartStore((state) => state.items);
  const increaseQuantity = useCartStore(
    (state) => state.increaseQuantity
  );
  const decreaseQuantity = useCartStore(
    (state) => state.decreaseQuantity
  );
  const removeFromCart = useCartStore(
    (state) => state.removeFromCart
  );
  const clearCart = useCartStore((state) => state.clearCart);

  // Total number of individual units in the cart
  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Calculate subtotal
  const subtotal = items.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  // Shipping calculation
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + shipping;
  const remainingForFreeShipping = Math.max(
    0,
    100 - subtotal
  );

  // Empty Cart
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
            Looks like you haven't added anything to your cart yet.
          </p>

          <Link
            to="/products"
            className="mt-8 inline-flex rounded-xl bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            Shopping Cart
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[var(--color-text)]">
            Your Cart
          </h1>

          <p className="mt-2 text-[var(--color-text-muted)]">
            {totalItems} {totalItems === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="w-fit text-sm font-semibold text-red-500 transition hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >
          Clear Cart
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <section
          aria-label="Cart items"
          className="space-y-4 lg:col-span-2"
        >
          {items.map((item) => {
            const itemTotal =
              item.product.price * item.quantity;

            const isAtStockLimit =
              item.quantity >= item.product.stock;

            return (
              <article
                key={item.product.id}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
              >
                <div className="flex gap-4 sm:gap-6">
                  {/* Product Image */}
                  <Link
                    to={`/products/${item.product.id}`}
                    className="shrink-0"
                    aria-label={`View ${item.product.name}`}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      loading="lazy"
                      className="h-24 w-24 rounded-xl object-cover sm:h-32 sm:w-32"
                    />
                  </Link>

                  {/* Product Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          to={`/products/${item.product.id}`}
                          className="font-semibold text-[var(--color-text)] transition hover:text-[var(--color-primary)]"
                        >
                          <h2 className="line-clamp-2">
                            {item.product.name}
                          </h2>
                        </Link>

                        <p className="mt-1 text-sm capitalize text-[var(--color-text-muted)]">
                          {item.product.category}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item.product.id)
                        }
                        aria-label={`Remove ${item.product.name} from cart`}
                        className="shrink-0 text-sm font-medium text-red-500 transition hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      {/* Quantity */}
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                          Quantity
                        </p>

                        <div className="flex w-fit items-center rounded-lg border border-[var(--color-border)]">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(item.product.id)
                            }
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.product.name}`}
                            className="px-3 py-2 text-lg transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            −
                          </button>

                          <span
                            aria-live="polite"
                            className="min-w-10 text-center text-sm font-semibold"
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(item.product.id)
                            }
                            disabled={isAtStockLimit}
                            aria-label={`Increase quantity of ${item.product.name}`}
                            className="px-3 py-2 text-lg transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        {isAtStockLimit && (
                          <p className="mt-2 text-xs text-amber-700">
                            Maximum available stock reached.
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-left sm:text-right">
                        <p className="text-sm text-[var(--color-text-muted)]">
                          ${item.product.price.toFixed(2)} each
                        </p>

                        <p className="mt-1 text-lg font-bold text-[var(--color-text)]">
                          ${itemTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Order Summary */}
        <aside className="h-fit rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            Order Summary
          </h2>

          {/* Free Shipping Message */}
          {shipping > 0 ? (
            <div className="mt-5 rounded-xl bg-blue-50 p-4">
              <p className="text-sm leading-6 text-blue-700">
                Add{" "}
                <span className="font-bold">
                  ${remainingForFreeShipping.toFixed(2)}
                </span>{" "}
                more to get free shipping.
              </p>
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-700">
                ✓ You qualify for free shipping!
              </p>
            </div>
          )}

          {/* Price Details */}
          <div className="mt-6 space-y-4">
            <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
              <span>Subtotal</span>

              <span className="font-medium text-[var(--color-text)]">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm text-[var(--color-text-muted)]">
              <span>Shipping</span>

              <span className="font-medium text-[var(--color-text)]">
                {shipping === 0
                  ? "Free"
                  : `$${shipping.toFixed(2)}`}
              </span>
            </div>

            <div className="border-t border-[var(--color-border)] pt-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-[var(--color-text)]">
                  Total
                </span>

                <span className="text-2xl font-bold text-[var(--color-text)]">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout */}
          <Link
            to="/checkout"
            className="mt-6 block rounded-xl bg-[var(--color-primary)] px-5 py-3.5 text-center font-semibold text-white transition hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            Proceed to Checkout
          </Link>

          {/* Continue Shopping */}
          <Link
            to="/products"
            className="mt-3 block text-center text-sm font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]"
          >
            ← Continue Shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}

export default CartPage;
