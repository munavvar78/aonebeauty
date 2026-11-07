"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setPending(false);
      return;
    }

    window.location.assign("/admin");
  }

  return (
    <form onSubmit={onSubmit} className="surface-card space-y-4 p-6">
      <label className="block space-y-1 text-sm">
        <span className="label-nav">Email</span>
        <input name="email" type="email" required className="field" />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="label-nav">Password</span>
        <input name="password" type="password" required className="field" />
      </label>
      {error && <p className="text-sm text-blush">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-espresso px-6 py-3 text-sm text-ivory disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
