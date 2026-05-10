export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email === process.env.ALLOWED_EMAIL;
}

export function isAuthorized(session: { user?: unknown } | null): boolean {
  return !!session?.user;
}
