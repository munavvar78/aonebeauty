"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ImageUploadForm({
  productId,
  currentImageUrl,
}: {
  productId: string;
  currentImageUrl?: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    form.set("productId", productId);

    const file = form.get("file");
    if (file instanceof File) {
      setPreview(URL.createObjectURL(file));
    }

    const response = await fetch("/api/admin/products/upload", {
      method: "POST",
      body: form,
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Upload failed");
      setPending(false);
      return;
    }
    setMessage(`Uploaded: ${data.path}`);
    if (data.publicUrl) setPreview(data.publicUrl);
    setPending(false);
    formEl.reset();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Product preview"
          className="aspect-[4/5] w-40 rounded-xl object-cover"
        />
      )}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="file"
          type="file"
          accept="image/*"
          required
          className="block w-full text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-espresso px-4 py-2 text-sm text-ivory disabled:opacity-60"
        >
          {pending ? "Uploading…" : "Upload image"}
        </button>
        {message && <p className="text-sm text-espresso-muted">{message}</p>}
      </form>
    </div>
  );
}
