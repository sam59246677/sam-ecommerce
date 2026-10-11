
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getProducts } from "../../services/productService";
import { getStoredAdminProducts, saveAdminProducts,} from "../../services/adminProductStorage";

import type { Product } from "../../types/product";
import ProductForm from "./ProductForm";
import type { ProductFormData } from "./ProductForm";

function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data, isPending, isError } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => getProducts(1, 100),
  });

  // Initialize products from localStorage or the API.
  useEffect(() => {
    if (!data || hasInitialized) {
      return;
    }

    const storedProducts = getStoredAdminProducts();

    setProducts(storedProducts ?? data.products);
    setHasInitialized(true);
  }, [data, hasInitialized]);

  // Save product changes to localStorage.
  useEffect(() => {
    if (hasInitialized) {
      saveAdminProducts(products);
    }
  }, [products, hasInitialized]);

  // Add a new product.
  const handleAddProduct = (formData: ProductFormData) => {
    const newProduct: Product = {
      id: Date.now(),
      ...formData,
      rating: 0,
    };

    setProducts((currentProducts) => [
      newProduct,
      ...currentProducts,
    ]);

    setIsFormOpen(false);
    setEditingProduct(null);
  };

  // Update an existing product.
  const handleEditProduct = (formData: ProductFormData) => {
    if (!editingProduct) {
      return;
    }

    const updatedProduct: Product = {
      ...editingProduct,
      ...formData,
    };

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === updatedProduct.id
          ? updatedProduct
          : product
      )
    );

    setIsFormOpen(false);
    setEditingProduct(null);
  };

  // Delete a product after confirmation.
  const handleDeleteProduct = (productId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) => product.id !== productId
      )
    );
  };

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  // Check errors before the loading state.
  if (isError) {
    return (
      <section className="p-6">
        <p className="text-red-600">
          Failed to load products. Please try again.
        </p>
      </section>
    );
  }

  if (isPending || !hasInitialized) {
    return (
      <section className="p-6">
        <p className="text-slate-600">
          Loading products...
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6 p-4 sm:p-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Products
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your store products.
          </p>
        </div>

        <button type="button"onClick={handleOpenAddForm}className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
          + Add Product
        </button>
      </div>

      {/* Products table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">
                  Product
                </th>

                <th className="px-5 py-4 font-semibold">
                  Category
                </th>

                <th className="px-5 py-4 font-semibold">
                  Price
                </th>

                <th className="px-5 py-4 font-semibold">
                  Stock
                </th>

                <th className="px-5 py-4 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg border border-slate-200 bg-white object-contain p-1"
                        />

                        <span className="max-w-[240px] font-medium text-slate-900">
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 capitalize text-slate-600">
                      {product.category.replaceAll("-", " ")}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900">
                      ${product.price.toFixed(2)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          product.stock > 0
                            ? "inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
                            : "inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
                        }
                      >
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsFormOpen(true);
                          }}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteProduct(product.id)
                          }
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Product count */}
        <div className="border-t border-slate-200 px-5 py-3">
          <p className="text-sm text-slate-500">
            Total products:{" "}
            <span className="font-semibold text-slate-800">
              {products.length}
            </span>
          </p>
        </div>
      </div>

      {/* Add/Edit product modal */}
      {isFormOpen && (
        <div onClick={handleCancelForm}className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div  onClick={(event) => event.stopPropagation()} role="dialog"aria-modal="true" aria-labelledby="product-form-title" className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 id="product-form-title"className="text-xl font-bold text-slate-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingProduct ? "Update the product information below.": "Enter the information for the new product."}
              </p>
            </div>

            <ProductForm
              key={editingProduct?.id ?? "new-product"}
              initialData={editingProduct}
              onSubmit={
                editingProduct
                  ? handleEditProduct
                  : handleAddProduct
              }
              onCancel={handleCancelForm}
            />
          </div>
        </div>
      )}
    </section>
  );
}
export default AdminProductsPage;