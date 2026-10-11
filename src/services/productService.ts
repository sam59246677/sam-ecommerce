
import { apiFetch } from "./api";
import type { Product } from "../types/product";

interface DummyProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  stock: number;
  rating: number;
}

interface ProductsResponse {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
}

export interface ProductsResult {
  products: Product[];
  total: number;
}

export type ProductSortOption =
  | "default"
  | "price-low"
  | "price-high"
  | "rating-high"
  | "name-asc";

function mapProduct(product: DummyProduct): Product {
  return {
    id: product.id,
    name: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    image: product.thumbnail,
    stock: product.stock,
    rating: product.rating,
  };
}

function sortProducts(
  products: Product[],
  sort: ProductSortOption
): Product[] {
  const result = [...products];

  switch (sort) {
    case "price-low":
      result.sort((a, b) => a.price - b.price);
      break;

    case "price-high":
      result.sort((a, b) => b.price - a.price);
      break;

    case "rating-high":
      result.sort((a, b) => b.rating - a.rating);
      break;

    case "name-asc":
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;

    default:
      break;
  }

  return result;
}

function addSortParams(
  params: URLSearchParams,
  sort: ProductSortOption
) {
  switch (sort) {
    case "price-low":
      params.set("sortBy", "price");
      params.set("order", "asc");
      break;

    case "price-high":
      params.set("sortBy", "price");
      params.set("order", "desc");
      break;

    case "rating-high":
      params.set("sortBy", "rating");
      params.set("order", "desc");
      break;

    case "name-asc":
      params.set("sortBy", "title");
      params.set("order", "asc");
      break;

    default:
      break;
  }
}

export async function getProducts(
  page: number,
  limit: number,
  search = "",
  category = "all",
  sort: ProductSortOption = "default"
): Promise<ProductsResult> {
  const skip = (page - 1) * limit;
  const trimmedSearch = search.trim();
  const hasSearch = Boolean(trimmedSearch);
  const hasCategory = category !== "all";

  /*
   * Combined search and category filtering.
   * Fetch all search matches, then filter, sort and paginate.
   */
  if (hasSearch && hasCategory) {
    const params = new URLSearchParams({
      q: trimmedSearch,
      limit: "0",
    });

    const response = await apiFetch<ProductsResponse>(
      `/products/search?${params.toString()}`
    );

    const filteredProducts = response.products
      .map(mapProduct)
      .filter((product) => product.category === category);

    const sortedProducts = sortProducts(filteredProducts, sort);

    return {
      products: sortedProducts.slice(skip, skip + limit),
      total: sortedProducts.length,
    };
  }

  /*
   * Search, category, or all products.
   */
  let endpoint = "/products";

  if (hasSearch) {
    endpoint = "/products/search";
  } else if (hasCategory) {
    endpoint = `/products/category/${encodeURIComponent(category)}`;
  }

  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  });

  if (hasSearch) {
    params.set("q", trimmedSearch);
  }

  addSortParams(params, sort);

  const response = await apiFetch<ProductsResponse>(
    `${endpoint}?${params.toString()}`
  );

  return {
    products: response.products.map(mapProduct),
    total: response.total,
  };
}

export async function getProduct(id: number): Promise<Product> {
  const product = await apiFetch<DummyProduct>(
    `/products/${id}`
  );

  return mapProduct(product);
}

export async function getCategories(): Promise<string[]> {
  return apiFetch<string[]>("/products/category-list");
}
