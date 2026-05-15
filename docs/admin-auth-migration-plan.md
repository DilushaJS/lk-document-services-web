Admin Auth Migration Plan

Goal
- Remove any remaining plaintext/admin-password checks and centralize admin auth using Supabase sessions/roles.

Scope
- Server-side API routes under `app/api/**`
- Admin UI: `app/admin/**` layouts/pages and `app/middleware.ts`
- Utility modules that check `ADMIN_PASSWORD` or read admin envs

Inventory (start point)
- Search for usages of `ADMIN_PASSWORD`, `admin_auth` cookie, or other ad-hoc checks.
- Key files to inspect/modify:
  - app/api/admin/delete-submission/route.ts
  - app/api/upload/route.ts
  - app/api/upload/signed-url/route.ts
  - app/api/stripe/checkout/route.ts
  - app/admin/layout.tsx
  - app/middleware.ts
  - lib/supabase/* (admin.ts, admin-auth.ts, server.ts)

Migration steps
1. Audit: list every ad-hoc admin check and where it occurs (grep).
2. Implement standardized helpers (if not present):
   - `getAdminSession(req)` — createServerClient + getSessionFromRequest
   - `isAdminUser(session.user.id)` — check `admin_users` table or Supabase role
3. Replace checks:
   - Replace any `ADMIN_PASSWORD` or cookie value checks with `getAdminSession()` + `isAdminUser()`.
   - For API routes: perform check early and return 401/403 consistently.
4. Add defense-in-depth:
   - Keep `app/middleware.ts` for coarse-grained routing protection.
   - Ensure `app/admin/layout.tsx` and critical admin pages call the server-side guard and redirect non-admins.
5. Secrets cleanup:
   - Remove `ADMIN_PASSWORD` from env, confirm no code references remain.
   - Remove any fallback logic that depended on plaintext secrets.
6. Tests:
   - Add integration tests for: unauthenticated, authenticated non-admin, authenticated admin flows for admin pages and APIs.
   - Add unit tests for `isAdminUser()` and error handling.
7. Staging rollout:
   - Deploy to staging, run smoke tests, verify admin flows and uploads/payments ownership checks.
8. Production rollout & monitoring:
   - Deploy to production behind feature flag or during low traffic window.
   - Monitor error logs and auth failures; ensure Supabase cookie settings are secure.
