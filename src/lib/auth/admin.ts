import { isAllowlistedAdmin } from "@/domain/admin";
import { auth } from "@/lib/auth/config";

export async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return { ok: false as const, error: "Not signed in" };
  }

  if (!isAllowlistedAdmin(email, process.env.ADMIN_EMAIL)) {
    return {
      ok: false as const,
      error: `Signed in as ${email}, but ADMIN_EMAIL must match that address`,
      user: { email },
    };
  }

  return { ok: true as const, user: { email } };
}
