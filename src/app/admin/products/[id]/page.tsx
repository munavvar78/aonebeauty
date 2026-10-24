import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { createServiceRoleClient } from "@/lib/supabase/server";
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
  const db = createServiceRoleClient();
  if (!db) notFound();

  const { data: product } = await db
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h2 className="font-display text-2xl">Edit {product.name}</h2>
      <ProductForm
        mode="edit"
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          category: product.category,
          pricePaise: product.price_paise,
          compareAtPricePaise: product.compare_at_price_paise ?? null,
          lowStockThreshold: product.low_stock_threshold,
          featured: product.featured,
          isActive: product.is_active,
          accentFrom: product.accent_from ?? "#f3d6cf",
          accentTo: product.accent_to ?? "#c97b7b",
        }}
      />
      <div className="surface-card space-y-3 p-5">
        <h3 className="font-display text-xl">Stock</h3>
        <p className="text-sm text-espresso-muted">
          On hand: {product.quantity}. Change quantity only through adjustments.
        </p>
        <StockAdjustForm productId={product.id} />
      </div>
      <div className="surface-card space-y-3 p-5">
        <h3 className="font-display text-xl">Image</h3>
        <ImageUploadForm
          productId={product.id}
          currentImageUrl={productImagePublicUrl(product.image_path)}
        />
      </div>
    </div>
  );
}
