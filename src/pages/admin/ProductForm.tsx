import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Product } from "../../types/product";

const productSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters."),

    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters."),

    price: z.coerce
        .number()
        .positive("Price must be greater than 0."),

    category: z
        .string()
        .min(1, "Please select a category."),

    image: z
        .string()
        .url("Please enter a valid image URL."),

    stock: z.coerce
        .number()
        .int("Stock must be a whole number.")
        .min(0, "Stock cannot be negative."),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
    initialData?: Product | null;
    onSubmit: (data: ProductFormData) => void;
    onCancel: () => void;
}

function ProductForm({
    initialData,
    onSubmit,
    onCancel,
}: ProductFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<
        z.input<typeof productSchema>,
        unknown,
        ProductFormData
    >({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
            price: initialData?.price ?? 0,
            category: initialData?.category ?? "",
            image: initialData?.image ?? "",
            stock: initialData?.stock ?? 0,
        },
    });

    const inputClasses = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
    const labelClasses = "block text-sm font-medium text-slate-700";
    const errorClasses = "mt-1 text-sm text-red-600";

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="name" className={labelClasses}>Product name</label>
                <input id="name" type="text" {...register("name")} className={inputClasses} placeholder="Enter product name" />
                {errors.name && (<p className={errorClasses}>{errors.name.message}</p>)}
            </div>

            <div>
                <label htmlFor="description" className={labelClasses}> Description</label>
                <textarea id="description" rows={3} {...register("description")} className={inputClasses} placeholder="Enter product description" />
                {errors.description && (<p className={errorClasses}>{errors.description.message}</p>)}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="price" className={labelClasses}>Price ($)</label>
                    <input id="price" type="number" min="0.01" step="0.01"{...register("price")} className={inputClasses} />
                    {errors.price && (<p className={errorClasses}>{errors.price.message}</p>)}
                </div>

                <div>
                    <label htmlFor="stock" className={labelClasses}>Stock</label>
                    <input id="stock" type="number" min="0" step="1" {...register("stock")} className={inputClasses} />
                    {errors.stock && ( <p className={errorClasses}>{errors.stock.message}</p> )}
                </div>
            </div>

            <div>
                <label htmlFor="category" className={labelClasses}> Category</label>

                <select id="category" {...register("category")} className={inputClasses} >
                    <option value="">Select a category</option>
                    <option value="beauty">Beauty</option>
                    <option value="fragrances">Fragrances</option>
                    <option value="furniture">Furniture</option>
                    <option value="groceries">Groceries</option>
                    <option value="home-decoration">Home decoration</option>
                    <option value="kitchen-accessories">Kitchen accessories</option>
                    <option value="laptops">Laptops</option>
                    <option value="mens-shirts">Men's shirts</option>
                    <option value="mens-shoes">Men's shoes</option>
                    <option value="mens-watches">Men's watches</option>
                    <option value="mobile-accessories">Mobile accessories</option>
                    <option value="smartphones">Smartphones</option>
                    <option value="sports-accessories">Sports accessories</option>
                    <option value="sunglasses">Sunglasses</option>
                    <option value="tablets">Tablets</option>
                    <option value="tops">Tops</option>
                    <option value="womens-bags">Women's bags</option>
                    <option value="womens-dresses">Women's dresses</option>
                    <option value="womens-jewellery"> Women's jewellery</option>
                    <option value="womens-shoes">Women's shoes</option>
                    <option value="womens-watches">Women's watches</option>
                </select>

                {errors.category && (<p className={errorClasses}>{errors.category.message}</p>)}
            </div>

            <div>
                <label htmlFor="image" className={labelClasses}>Image URL</label>
                <input id="image" type="url"{...register("image")}className={inputClasses} placeholder="https://example.com/image.jpg"/>
                {errors.image && (<p className={errorClasses}>{errors.image.message}</p>)}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button type="button"onClick={onCancel}className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    Cancel
                </button>

                <button type="submit"disabled={isSubmitting}className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                    {initialData ? "Save Changes" : "Add Product"}
                </button>
            </div>
        </form>
    );
}
export default ProductForm;