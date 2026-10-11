
import { Link } from "react-router-dom";
import type { Product } from "../../types/product";
import useCartStore from "../../store/cartStore";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const isOutOfStock = product.stock <= 0;
  const isLowStock =
    product.stock > 0 && product.stock <= 5;

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Product Image */}
      <Link
        to={`/products/${product.id}`}
        className="relative block overflow-hidden"
        aria-label={`View details for ${product.name}`}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src =
              "https://placehold.co/600x600?text=Image+Unavailable";
          }}
          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Category Badge */}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold capitalize text-[var(--color-text)] shadow-sm backdrop-blur">
          {product.category}
        </span>

        {/* Stock Badges */}
        {isOutOfStock && (
          <span className="absolute right-4 top-4 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            Out of Stock
          </span>
        )}

        {isLowStock && (
          <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Only {product.stock} left
          </span>
        )}
      </Link>

      {/* Product Content */}
      <div className="p-5">
        <Link to={`/products/${product.id}`}>
          <h2 className="line-clamp-1 text-lg font-semibold text-[var(--color-text)] transition hover:text-[var(--color-primary)]">
            {product.name}
          </h2>
        </Link>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[var(--color-text-muted)]">
          {product.description}
        </p>

        {/* Rating */}
        <div
          className="mt-4 flex items-center gap-2"
          aria-label={`Customer rating: ${product.rating.toFixed(1)} out of 5`}
        >
          <span
            aria-hidden="true"
            className="text-sm font-medium text-[var(--color-text)]"
          >
            ⭐ {product.rating.toFixed(1)}
          </span>

          <span className="text-xs text-[var(--color-text-muted)]">
            Customer rating
          </span>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-2xl font-bold text-[var(--color-text)]">
            ${product.price.toFixed(2)}
          </span>

          {!isOutOfStock && (
            <span className="text-xs font-medium text-green-600">
              In stock
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 rounded-xl border border-[var(--color-border)] px-3 py-3 text-center text-sm font-semibold text-[var(--color-text)] transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            View Details
          </Link>

          <button
            type="button"
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            className="flex-1 rounded-xl bg-[var(--color-primary)] px-3 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isOutOfStock ? "Unavailable" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;