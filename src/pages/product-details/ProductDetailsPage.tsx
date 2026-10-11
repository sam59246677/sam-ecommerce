
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getProduct } from "../../services/productService";
import useCartStore from "../../store/cartStore";

function ProductDetailsPage() {
  const { id } = useParams();

  const productId = Number(id);
  const isValidId =
    id !== undefined &&
    Number.isInteger(productId) &&
    productId > 0;

  const [quantity, setQuantity] = useState(1);

  const addToCart = useCartStore((state) => state.addToCart);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: isValidId,
  });

  useEffect(() => {
    setQuantity(1);
  }, [id]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-gray-200" />

          <div className="space-y-5">
            <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-24 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-12 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </main>
    );
  }

  if (!isValidId || isError || !product) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center"
        >
          <h1 className="text-2xl font-bold text-red-700">
            Product not found
          </h1>

          <p className="mt-3 text-red-600">
            We couldn't load the product you're looking for.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-block rounded-xl bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
          >
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock =
    product.stock > 0 && product.stock <= 5;

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(product.stock, current + 1)
    );
  };

  const handleAddToCart = () => {
    if (isOutOfStock || quantity > product.stock) {
      return;
    }

    addToCart(product, quantity);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-8 text-sm text-[var(--color-text-muted)]"
      >
        <Link
          to="/products"
          className="transition hover:text-[var(--color-primary)]"
        >
          Products
        </Link>

        <span className="mx-2">/</span>

        <span className="capitalize">{product.category}</span>

        <span className="mx-2">/</span>

        <span className="text-[var(--color-text)]">
          {product.name}
        </span>
      </nav>

      {/* Product Main Section */}
      <section className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Product Image */}
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="aspect-square w-full object-cover"
          />
        </div>

        {/* Product Information */}
        <div className="flex flex-col">
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold capitalize text-[var(--color-primary)]">
            {product.category}
          </span>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--color-text)]">
            {product.name}
          </h1>

          {/* Rating */}
          <div
            className="mt-4 flex items-center gap-3"
            aria-label={`Customer rating: ${product.rating.toFixed(1)} out of 5`}
          >
            <span aria-hidden="true" className="text-lg">
              ⭐
            </span>

            <span className="font-semibold text-[var(--color-text)]">
              {product.rating.toFixed(1)}
            </span>

            <span className="text-sm text-[var(--color-text-muted)]">
              Customer rating
            </span>
          </div>

          {/* Price */}
          <div className="mt-6">
            <span className="text-4xl font-bold text-[var(--color-text)]">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Description */}
          <p className="mt-6 text-base leading-7 text-[var(--color-text-muted)]">
            {product.description}
          </p>

          {/* Stock */}
          <div className="mt-6" aria-live="polite">
            {isOutOfStock ? (
              <p className="font-semibold text-red-600">
                Out of stock
              </p>
            ) : isLowStock ? (
              <p className="font-semibold text-amber-600">
                Only {product.stock} items left in stock
              </p>
            ) : (
              <p className="font-semibold text-green-600">
                In stock
              </p>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          {!isOutOfStock && (
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <div
                className="flex w-fit items-center rounded-xl border border-[var(--color-border)]"
                aria-label="Choose quantity"
              >
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="px-4 py-3 text-lg text-[var(--color-text)] transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>

                <span
                  className="min-w-12 text-center font-semibold"
                  aria-live="polite"
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                  className="px-4 py-3 text-lg text-[var(--color-text)] transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 rounded-xl bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
              >
                Add {quantity} to Cart
              </button>
            </div>
          )}

          <Link
            to="/products"
            className="mt-4 w-fit text-sm font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]"
          >
            ← Back to Products
          </Link>
        </div>
      </section>

      {/* Product Information */}
      <section className="mt-16 border-t border-[var(--color-border)] pt-10">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          Product Information
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
            <p className="text-sm text-[var(--color-text-muted)]">
              Category
            </p>

            <p className="mt-2 font-semibold capitalize text-[var(--color-text)]">
              {product.category}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
            <p className="text-sm text-[var(--color-text-muted)]">
              Product ID
            </p>

            <p className="mt-2 font-semibold text-[var(--color-text)]">
              #{product.id}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
            <p className="text-sm text-[var(--color-text-muted)]">
              Available Stock
            </p>

            <p className="mt-2 font-semibold text-[var(--color-text)]">
              {product.stock} units
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductDetailsPage;
