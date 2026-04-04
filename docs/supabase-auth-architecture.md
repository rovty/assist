# Supabase Auth Architecture

## Overview

The ROVTY dashboard now treats Supabase Auth as the identity provider and keeps only app-specific authorization in the local database.

### Identity vs authorization

- Supabase owns:
  - Google login
  - Microsoft login
  - email/password login
  - magic-link login
  - JWT issuance and social identity handling
- Assist owns:
  - local user record
  - tenant membership
  - role
  - permissions snapshot derived from role
  - billing plan and other app-specific access rules

## Updated auth architecture

### Dashboard

- The dashboard signs users in directly with Supabase.
- The dashboard sends the Supabase access token to the API Gateway as the `Authorization: Bearer <token>` header.
- The dashboard protects app routes with a client-side auth guard backed by the Supabase session and the local `/auth/me` profile lookup.

### API Gateway

- The gateway no longer verifies bearer tokens with the local `JWT_SECRET`.
- It forwards bearer tokens to `POST /auth/context` on the Auth service.
- The Auth service validates the Supabase JWT, resolves the local user, tenant, role, and permissions, and returns a normalized auth context.
- The gateway injects:
  - `x-tenant-id`
  - `x-user-id`
  - `x-user-role`
  - `x-user-email`
  - `x-request-id`

### Auth service

- Validates Supabase JWTs against Supabase JWKS.
- Resolves or provisions a local user record.
- Links identities by:
  1. provider + provider user id
  2. Supabase user id
  3. verified email fallback
- Returns local authorization context without storing passwords locally.

### Future SSO structure

- `auth_identities` supports multiple providers per local user.
- `sso_connections` provides a tenant-scoped placeholder for future OIDC/SAML enterprise SSO.

## Required database changes

Applied in migration:
- [20260315170000_supabase_auth/migration.sql](/Users/iresh/Documents/Rovty/services/assist/assist/services/auth/prisma/migrations/20260315170000_supabase_auth/migration.sql)

### Schema changes

- `users.password_hash` is now nullable.
- Added `AuthProvider` enum.
- Added `auth_identities` table:
  - local user linkage
  - provider
  - supabase user id
  - provider user id
  - email
  - last used timestamp
- Added `sso_connections` table:
  - tenant-scoped future enterprise SSO config
  - provider
  - domain
  - OIDC/SAML metadata fields

## UI login flow

### Login page

- `Continue with Google`
- `Continue with Microsoft`
- email + password
- magic-link fallback

### Register page

- social signup with Google or Microsoft
- email/password signup with `name` + `workspaceName`
- magic-link fallback

### Callback flow

- Supabase redirects to `/auth/callback`
- the dashboard restores the Supabase session
- the user is redirected to the requested route
- the first authenticated `/auth/me` call provisions or links the local account

## Backend middleware

### Auth service

- [auth.service.ts](/Users/iresh/Documents/Rovty/services/assist/assist/services/auth/src/services/auth.service.ts)
  - validates Supabase JWTs with JWKS
  - blacklists tokens on logout for app-side immediate revoke
  - maps social identities to local users and tenants

- [auth.routes.ts](/Users/iresh/Documents/Rovty/services/assist/assist/services/auth/src/routes/auth.routes.ts)
  - `POST /auth/context`
  - `GET /auth/me`
  - `POST /auth/logout`
  - keeps legacy password routes as deprecated responses

### API Gateway

- [auth.ts](/Users/iresh/Documents/Rovty/services/assist/assist/services/api-gateway/src/middleware/auth.ts)
  - delegates bearer-token validation to the Auth service
  - injects normalized tenant/user headers for downstream services

### Dashboard

- [auth.ts](/Users/iresh/Documents/Rovty/services/assist/assist/apps/dashboard/src/lib/auth.ts)
  - Supabase sign-in helpers
  - social login
  - magic-link fallback
  - logout

- [auth-guard.tsx](/Users/iresh/Documents/Rovty/services/assist/assist/apps/dashboard/src/components/auth/auth-guard.tsx)
  - route protection for dashboard pages

## Account linking rules

- If an incoming Supabase identity matches an existing provider identity, use that local user.
- Else if it matches an existing Supabase user id, attach the current provider to that user.
- Else if the email matches an existing local user, create a new linked identity for that same local account.
- Email-based linking only happens when the upstream Supabase identity reports a verified email.
- Else provision a new tenant and owner user automatically.

This lets one person use Google or Microsoft and still resolve to the same local account.

## Migration steps

1. Create a Supabase project.
2. Enable Google and Microsoft providers in Supabase Auth.
3. Set dashboard env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Set auth service env vars:
   - `SUPABASE_URL`
   - `SUPABASE_JWKS_URL`
   - `SUPABASE_JWT_ISSUER`
   - `SUPABASE_JWT_AUDIENCE`
5. Apply the auth DB migration:
   - `pnpm --filter @assist/auth db:migrate:deploy`
6. Regenerate Prisma client:
   - `pnpm --filter @assist/auth db:generate`
7. Restart:
   - Auth service
   - API Gateway
   - Dashboard
8. Sign in with Google, Microsoft, password, or magic link.
9. Verify `/auth/me` returns the local tenant, role, and identity mapping.

## Notes

- Legacy local password endpoints now return migration guidance instead of authenticating directly.
- Passwords are no longer stored or verified by the app.
- Existing local users can be linked to Supabase identities by matching email on first sign-in.
