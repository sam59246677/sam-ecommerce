
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import ProductGrid from "../../components/product/ProductGrid";
import {
  getCategories,
  getProducts,
  type ProductSortOption,
} from "../../services/productService";

const PRODUCTS_PER_PAGE = 8;
const SEARCH_DEBOUNCE_DELAY = 300;

function ProductsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] =
    useState<ProductSortOption>("default");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, SEARCH_DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [search]);

  // Categories
  const { data: categories = [] } = useQuery({
    queryKey: ["product-categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60,
  });

  // Products
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      "products",
      currentPage,
      debouncedSearch,
      category,
      sort,
    ],
    queryFn: () =>
      getProducts(
        currentPage,
        PRODUCTS_PER_PAGE,
        debouncedSearch,
        category,
        sort
      ),
    staleTime: 1000 * 30,
  });

  const products = data?.products ?? [];
  const totalProducts = data?.total ?? 0;

  const totalPages = Math.ceil(
    totalProducts / PRODUCTS_PER_PAGE
  );

  // Page change
  const handlePageChange = (page: number) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("all");
    setSort("default");
    setCurrentPage(1);
  };

  // Search change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Category change
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrentPage(1);
  };

  // Sort change
  const handleSortChange = (value: ProductSortOption) => {
    setSort(value);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "all" ||
    sort !== "default";

  // Loading
  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="border-b border-[var(--color-border)] pb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            Store
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[var(--color-text)]">
            Products
          </h1>

          <p className="mt-2 text-[var(--color-text-muted)]">
            Browse our products and find exactly what you need.
          </p>
        </div>

        <div
          aria-label="Loading products"
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {Array.from({ length: PRODUCTS_PER_PAGE }).map(
            (_, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="animate-pulse overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white"
              >
                <div className="aspect-[4/3] bg-gray-200" />

                <div className="space-y-3 p-5">
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-5 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-10 w-full rounded bg-gray-200" />
                </div>
              </div>
            )
          )}
        </div>

        <p role="status" className="sr-only">
          Loading products. Please wait.
        </p>
      </main>
    );
  }

  // Error
  if (isError) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
        >
          <h1 className="text-xl font-semibold text-red-800">
            Unable to load products
          </h1>

          <p className="mt-2 text-sm text-red-700">
            Something went wrong while loading the products.
            Please try again.
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-5 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] pb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
          Store
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-[var(--color-text)]">
          Products
        </h1>

        <p className="mt-2 max-w-2xl text-[var(--color-text-muted)]">
          Browse our products and find exactly what you need.
        </p>
      </header>

      {/* Filters */}
      <section
        aria-label="Product filters"
        className="mt-8 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {/* Search */}
          <div>
            <label
              htmlFor="product-search"
              className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
            >
              Search
            </label>

            <input
              id="product-search"
              type="search"
              value={search}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
              placeholder="Search products..."
              autoComplete="off"
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category-filter"
              className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
            >
              Category
            </label>

            <select
              id="category-filter"
              value={category}
              onChange={(event) =>
                handleCategoryChange(event.target.value)
              }
              className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label
              htmlFor="sort-products"
              className="mb-2 block text-sm font-semibold text-[var(--color-text)]"
            >
              Sort By
            </label>

            <select
              id="sort-products"
              value={sort}
              onChange={(event) =>
                handleSortChange(
                  event.target.value as ProductSortOption
                )
              }
              className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100"
            >
              <option value="default">Default</option>
              <option value="price-low">
                Price: Low to High
              </option>
              <option value="price-high">
                Price: High to Low
              </option>
              <option value="rating-high">
                Rating: High to Low
              </option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Results summary */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
          <p
            aria-live="polite"
            className="text-sm text-[var(--color-text-muted)]"
          >
            {totalProducts}{" "}
            {totalProducts === 1 ? "product" : "products"} found
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-md text-sm font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Products */}
      {products.length === 0 ? (
        <section
          aria-labelledby="no-products-heading"
          className="mt-8 rounded-2xl border border-[var(--color-border)] bg-white p-10 text-center shadow-sm"
        >
          <h2
            id="no-products-heading"
            className="text-xl font-semibold text-[var(--color-text)]"
          >
            No products found
          </h2>

          <p className="mt-2 text-[var(--color-text-muted)]">
            Try changing your search or filter options.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Reset Filters
          </button>
        </section>
      ) : (
        <>
          <section
            aria-label="Product results"
            aria-busy={isFetching}
            className="mt-8"
          >
            {isFetching && (
              <p
                role="status"
                className="mb-3 text-right text-xs font-medium text-[var(--color-text-muted)]"
              >
                Updating products...
              </p>
            )}

            <ProductGrid products={products} />
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Product pagination"
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
            >
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  handlePageChange(currentPage - 1)
                }
                className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  aria-current={
                    page === currentPage ? "page" : undefined
                  }
                  aria-label={`Page ${page}`}
                  onClick={() => handlePageChange(page)}
                  className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    page === currentPage
                      ? "bg-[var(--color-primary)] text-white"
                      : "border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  handlePageChange(currentPage + 1)
                }
                className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}

export default ProductsPage;
