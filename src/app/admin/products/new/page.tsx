import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/admin");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="font-display text-2xl">New product</h2>
      <ProductForm mode="create" />
    </div>
  );
}
