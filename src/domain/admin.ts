export function isAllowlistedAdmin(
  email: string | null | undefined,
  adminEmail: string | undefined,
): boolean {
  if (!email || !adminEmail) return false;
  return email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
}
