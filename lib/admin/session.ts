/**
 * Admin auth placeholder.
 * Replace with Supabase Auth / session checks when login is added.
 */
export function isAdminAuthenticated(): boolean {
  return true;
}

export async function requireAdminSession(): Promise<boolean> {
  return isAdminAuthenticated();
}
