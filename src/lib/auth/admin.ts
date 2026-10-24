import { isAllowlistedAdmin } from "@/domain/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false as const, error: "Supabase is not configured" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { ok: false as const, error: "Not signed in" };
  }

  if (!isAllowlistedAdmin(user.email, process.env.ADMIN_EMAIL)) {
    return {
      ok: false as const,
      error: `Signed in as ${user.email}, but ADMIN_EMAIL must match that address`,
      user,
    };
  }

  return { ok: true as const, user, supabase };
}
