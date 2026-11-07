import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { isMongoConfigured } from "@/lib/mongo";
import { findProductById } from "@/lib/repositories/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { StockAdjustForm } from "@/components/admin/StockAdjustForm";
import { ImageUploadForm } from "@/components/admin/ImageUploadForm";
import { productImagePublicUrl } from "@/lib/storage";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/admin");

  const { id } = await params;
  if (!isMongoConfigured()) notFound();

  const product = await findProductById(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h2 className="font-display text-2xl">Edit {product.name}</h2>
      <ProductForm
        mode="edit"
        product={{
          id: product._id.toHexString(),
          slug: product.slug,
          name: product.name,
          description: product.description,
          category: product.category,
          pricePaise: product.pricePaise,
          compareAtPricePaise: product.compareAtPricePaise ?? null,
          lowStockThreshold: product.lowStockThreshold,
          featured: product.featured,
          isActive: product.isActive,
          accentFrom: product.accentFrom ?? "#f3d6cf",
          accentTo: product.accentTo ?? "#c97b7b",
        }}
      />
      <div className="surface-card space-y-3 p-5">
        <h3 className="font-display text-xl">Stock</h3>
        <p className="text-sm text-espresso-muted">
          On hand: {product.quantity}. Change quantity only through adjustments.
        </p>
        <StockAdjustForm productId={product._id.toHexString()} />
      </div>
      <div className="surface-card space-y-3 p-5">
        <h3 className="font-display text-xl">Image</h3>
        <ImageUploadForm
          productId={product._id.toHexString()}
          currentImageUrl={productImagePublicUrl(product.imagePath)}
        />
      </div>
    </div>
  );
}
