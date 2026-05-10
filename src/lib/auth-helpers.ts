export function isValidCredentials(
  email: unknown,
  password: unknown
): boolean {
  if (typeof email !== "string" || typeof password !== "string") return false;
  return (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  );
}

export function isAuthorized(session: { user?: unknown } | null): boolean {
  return !!session?.user;
}
