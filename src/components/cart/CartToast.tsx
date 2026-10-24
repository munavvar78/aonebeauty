"use client";

import Link from "next/link";
import { useEffect } from "react";

export function CartToast({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(onClose, 2800);
    return () => window.clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-[90] flex w-[min(92vw,22rem)] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-white/15 bg-ink/95 px-4 py-3 text-sm text-paper shadow-[0_20px_50px_-20px_rgba(255,61,110,0.55)] backdrop-blur-md"
    >
      <p>{message}</p>
      <Link
        href="/cart"
        className="shrink-0 rounded-full bg-rose px-3 py-1.5 text-xs font-medium text-white"
        onClick={onClose}
      >
        View bag
      </Link>
    </div>
  );
}
