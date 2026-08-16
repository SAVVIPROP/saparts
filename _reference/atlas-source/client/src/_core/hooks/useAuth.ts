/**
 * Portable public-build auth adapter. Public routes have no Manus or OAuth requirement.
 * Replace this module with your own provider (Clerk, Auth.js, Supabase, etc.) when enabling /admin.
 */
type PortableUser = { id: number; name?: string | null; email?: string | null; role?: "admin" | "user" };
export function useAuth(): { user: PortableUser | null; loading: boolean; error: Error | null; isAuthenticated: boolean; refresh: () => Promise<void>; logout: () => Promise<void> } {
  return { user: null, loading: false, error: null, isAuthenticated: false, refresh: async () => undefined, logout: async () => undefined };
}
