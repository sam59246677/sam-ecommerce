
import type { Product } from "../types/product";

const STORAGE_KEY = "admin-products-storage";

export function getStoredAdminProducts(): Product[] | null {
    try {
        const storedProducts = localStorage.getItem(STORAGE_KEY);
        if (storedProducts === null) {
            return null;
        }

        const parsedProducts: unknown = JSON.parse(storedProducts);
        if (!Array.isArray(parsedProducts)) {
            return null;
        }

        return parsedProducts as Product[];
    } catch {
        return null;
    }
}

export function saveAdminProducts(products: Product[]): void {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(products)
        );
    } catch {
        console.error("Could not save products to localStorage.");
    }
}