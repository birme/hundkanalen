# hundkanalen

Property rental management app (vacation property, Hälsingland, Sweden) with admin and guest portals.

## Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript 5 (strict)
- **Styling**: Tailwind CSS 3 with custom palette (forest, wood, cream, falu)
- **Auth**: NextAuth 5 beta — JWT sessions, Credentials provider, roles: `admin` / `guest`
- **Database**: PostgreSQL via `postgres` client (`src/lib/db.ts`), connection pool max 10
- **Email**: Nodemailer (`src/lib/email.ts`)

## Project layout

```
src/
  app/          Next.js App Router pages and API routes
    admin/      Admin dashboard (stays, checklists, photos, users, settings)
    api/        REST endpoints
      admin/    Admin-only endpoints (requireAdmin guard)
      auth/     NextAuth handler
      availability/  Public booking availability check
      bookings/ Cross-role bookings (auth() with role branching)
      contact/  Public contact/inquiry form
      guest/    Guest-session endpoints (getGuestSession guard)
      health/   Health check
      photos/   Public photo serving (binary response)
      public/   Intentionally unauthenticated data endpoints
      seed/     One-time database initialization
    stay/       Guest portal
  components/   React components (admin/, landing/, layout/, portal/)
  lib/          Shared utilities (auth, db, email, access-code, guest-auth, admin-auth)
migrations/     SQL migration files (run manually against the database)
```

Path alias: `@/*` → `src/*`

## Commands

```bash
npm run dev      # development server
npm run build    # production build (next build)
npm start        # production server (PORT env var, default 3000)
npm run lint     # ESLint via next lint
```

No test runner is configured. Type-check with `npx tsc --noEmit`.

## Coding conventions

- TypeScript strict mode is on — no `any` casts, no `@ts-ignore` without an explanatory comment.
- API routes live under `src/app/api/`. Each route file exports named HTTP-method handlers (`GET`, `POST`, etc.) and must begin with `export const dynamic = 'force-dynamic'`.
- Server-side portal pages (`src/app/stay/portal/**/*.tsx`) also require `export const dynamic = 'force-dynamic'` as the first export since they perform per-request data fetching.
- Response shape: use `Response.json(data, { status })` in all API routes — never `NextResponse.json()`. `NextResponse` is reserved for `src/middleware.ts` only (redirects and pass-through via `NextResponse.next()`).
- Error responses always have the shape `{ error: 'message' }` with an appropriate HTTP status code.
- Auth guards — three API tiers plus a cross-role pattern, do not mix them arbitrarily:
  - **Admin routes** (`src/app/api/admin/`): `import { requireAdmin } from '@/lib/admin-auth'` → `const session = await requireAdmin(); if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });`
  - **Guest routes** (`src/app/api/guest/`): `import { getGuestSession } from '@/lib/guest-auth'` → `const session = await getGuestSession(); if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });`
  - **Public routes** (`src/app/api/public/` and any root-level public route such as `contact/` or `availability/`): most serve truly unauthenticated data with no guard. Exception: gallery-content routes (`public/full-gallery`, `public/check-access`) check the `hk-site-access` cookie OR a valid guest session — this is the **site-access gate** (see below), not a session-based auth guard. Do not add a session guard here.
  - **Cross-role routes** (e.g. `src/app/api/bookings/`): use `import { auth } from '@/lib/auth'` directly, then branch on `session.user.role` to return role-appropriate data — only use this pattern when a single endpoint must serve both admin and authenticated users with different payloads.
  - Note: there is **no** `requireGuest()` function — always use `getGuestSession()` for guest API routes.
- **Site-access gate** (`hk-site-access` cookie): a separate, lightweight gate for the landing/gallery experience — distinct from admin and guest session auth. Set by `POST /api/public/verify-code` when the visitor supplies the correct global access code (stored as `site_settings.global_access_code`). The cookie (`httpOnly`, `sameSite: lax`, 30-day expiry) is checked by `GET /api/public/check-access` and `GET /api/public/full-gallery`. A valid guest session is also accepted in lieu of the cookie. Do not conflate this with admin/guest session auth.
- Middleware (`src/middleware.ts`): performs a lightweight cookie-presence check at request time before any page or layout runs. It redirects unauthenticated `/admin/*` requests to `/login?callbackUrl=…` and unauthenticated `/stay/portal/*` requests to `/stay`. This is a fast gate only — it does not verify JWT signatures. Full verification happens in the layout/page.
- Page-level auth (server components, not API routes):
  - **Admin pages**: auth is enforced once in `src/app/admin/layout.tsx` via `auth()` + `redirect()`. Individual admin page components do not need their own guard.
  - **Guest portal pages**: auth is enforced by `src/app/stay/portal/layout.tsx` via `getGuestSession()` + `redirect()`. Individual pages under `src/app/stay/portal/` also call `getGuestSession()` to obtain `stayId` for their own data queries — this is necessary for data access, not redundant auth. Always call `getGuestSession()` at the top of any new guest portal page and redirect if null.
- Binary responses: routes that serve raw binary data (e.g. `src/app/api/photos/[id]/route.ts`) return `new Response(buffer, { headers })` instead of `Response.json()`. This is the only valid exception to the `Response.json()` rule — use it only when returning non-JSON content such as image bytes.
- Dynamic route context: routes with `[id]` segments must type `params` as a Promise and await it:
  ```ts
  type RouteContext = { params: Promise<{ id: string }> };
  export async function GET(_req: NextRequest, context: RouteContext) {
    const { id } = await context.params;
  }
  ```
- Database access: call `getDb()` inside each handler to get the tagged-template `sql` client (`import { getDb } from '@/lib/db'`). Do not import a module-level `sql` singleton. Typed result rows: `sql<{ id: string }[]>\`SELECT ...\``. Dynamic partial updates: pass a `Record<string, unknown>` directly — `sql\`UPDATE t SET ${sql(updates)} WHERE id = ${id}\``.
- Photo storage: photos are stored as base64 data URLs (`data:<mime>;base64,...`) in the `storage_url` column of the `photos` table. There is no external file storage service. The `is_public` boolean column controls whether a photo appears in the public landing gallery. The `category` column (text, default `'general'`) categorises photos; `'keybox'` is a known special value used to exclude keybox photos from portal display. Photos referenced by `checklist_items.photo_id` or `property_info.photo_id` are considered owned by that content item and **must be excluded** from gallery listing queries (see `public/photos` and `public/full-gallery` for the exclusion pattern).
- Photo embedding in pages — two distinct patterns, never mix them:
  - **Via `/api/photos/[id]`** (binary API route): use a plain `<img>` tag with `// eslint-disable-next-line @next/next/no-img-element`. Do **not** use Next.js `<Image>` here — the binary route is not a static asset.
  - **Via `storage_url` data URL directly** (e.g. rendering a photo fetched from the DB in a server component): use Next.js `<Image fill sizes="...">` — data URIs do not require hostname config and benefit from layout-fill rendering.
- Orderable tables (`checklist_items`, `property_info`): use a `sort_order INTEGER` column. Dedicated `POST /reorder` endpoints accept `{ orderedIds: string[] }` and write sequential integers (0-indexed) back to `sort_order`. Always `ORDER BY sort_order ASC` when listing these rows.
- `checklist_property_info` join table: links `checklist_items.id` → `property_info.id`. Managed by `GET/PUT /api/admin/checklists/[id]/links`. Use `ON CONFLICT DO NOTHING` when inserting links.
- Tailwind utility classes only — no inline `style=` props. Custom component classes from `src/app/globals.css`:
  - `.btn-primary` — forest-green filled button
  - `.btn-secondary` — wood-brown filled button
  - `.btn-outline` — forest-green outlined button
  - `.section-padding` — standard page-section padding (`px-4 py-16 sm:px-6 lg:px-8`)
  - `.container-narrow` — centered `max-w-4xl` container
  - `.container-wide` — centered `max-w-7xl` container
- No test framework is present; PRs must pass `npm run lint` and `npx tsc --noEmit` cleanly.
- Keep migrations additive; never alter or delete an existing migration file. Name new migrations with a sequential 3-digit prefix: `NNN_description.sql`. The current highest migration is `007`, so the next file must be `008_description.sql`. Note: migration files 004–006 are absent from the `migrations/` directory (the sequence jumps from `003` to `007`) — this is intentional, do not attempt to fill the gap. Tables and columns introduced by those absent migrations (`guest_reviews`, `checklist_property_info`, `stays.packing_notes`, `stays.keybox_code`, `stay_favorites`, `favorite_places.owner_tips`) exist in the live database schema and are safe to query.

## Shared utilities

**`src/lib/utils.ts`**

| Function | Purpose |
|---|---|
| `formatSEK(amount)` | Format a number as Swedish krona (SEK) |
| `formatDate(date)` | Long Swedish date string (e.g. "4 maj 2026") |
| `formatDateShort(date)` | Short Swedish date string (YYYY-MM-DD) |
| `daysBetween(start, end)` | Number of days between two dates |
| `classNames(...classes)` | Conditionally join Tailwind class strings |

**`src/lib/access-code.ts`**

| Function | Purpose |
|---|---|
| `generateUniqueAccessCode(length?)` | Generates a collision-checked, URL-safe 8-char access code (default), avoiding ambiguous chars (0/O, 1/I/L) |

**`src/lib/guest-auth.ts`**

| Function | Purpose |
|---|---|
| `createGuestSession(stayId, guestName, checkOut)` | Mints a signed JWT, sets the `hundkanalen-guest-session` cookie |
| `getGuestSession()` | Reads and verifies the guest cookie; returns `{ stayId, guestName }` or `null` |
| `clearGuestSession()` | Deletes the guest session cookie |

**`src/lib/email.ts`**

| Function | Purpose |
|---|---|
| `sendContactEmail(params)` | Sends a contact/inquiry email via Nodemailer SMTP; params: `{ name, email, checkin?, checkout?, guests?, message? }` |

Use these instead of reimplementing equivalent logic.

## Deployment

Deployed on Vercel (inferred from `.vercel` in `.gitignore`). Environment variables required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and any Nodemailer SMTP vars.

## Agent team

| Agent | Role |
|---|---|
| `developer` | Implements sub-tickets end-to-end, opens a PR, stops |
| `reviewer` | Reviews the PR diff against acceptance criteria, posts a single verdict comment |
