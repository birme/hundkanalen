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
    api/        REST endpoints (admin/, auth/, contact/, health/)
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
- Response shape: use `Response.json(data, { status })` in all API routes — never `NextResponse.json()`. `NextResponse` is reserved for `src/middleware.ts` only (redirects and pass-through via `NextResponse.next()`).
- Error responses always have the shape `{ error: 'message' }` with an appropriate HTTP status code.
- Auth guards — three tiers, do not mix:
  - **Admin routes** (`src/app/api/admin/`): `import { requireAdmin } from '@/lib/admin-auth'` → `const session = await requireAdmin(); if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });`
  - **Guest routes** (`src/app/api/guest/`): `import { getGuestSession } from '@/lib/guest-auth'` → `const session = await getGuestSession(); if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });`
  - **Public routes** (`src/app/api/public/`): no auth guard — these intentionally serve unauthenticated data (gallery photos, availability, site-access check). Do not add a guard here.
  - Note: there is **no** `requireGuest()` function — always use `getGuestSession()` for guest API routes.
- Dynamic route context: routes with `[id]` segments must type `params` as a Promise and await it:
  ```ts
  type RouteContext = { params: Promise<{ id: string }> };
  export async function GET(_req: NextRequest, context: RouteContext) {
    const { id } = await context.params;
  }
  ```
- Database access: call `getDb()` inside each handler to get the tagged-template `sql` client (`import { getDb } from '@/lib/db'`). Do not import a module-level `sql` singleton. Typed result rows: `sql<{ id: string }[]>\`SELECT ...\``. Dynamic partial updates: pass a `Record<string, unknown>` directly — `sql\`UPDATE t SET ${sql(updates)} WHERE id = ${id}\``.
- Photo storage: photos are stored as base64 data URLs (`data:<mime>;base64,...`) in the `storage_url` column of the `photos` table. There is no external file storage service.
- Tailwind utility classes only — no inline `style=` props. Custom component classes from `src/app/globals.css`:
  - `.btn-primary` — forest-green filled button
  - `.btn-secondary` — wood-brown filled button
  - `.btn-outline` — forest-green outlined button
  - `.section-padding` — standard page-section padding (`px-4 py-16 sm:px-6 lg:px-8`)
  - `.container-narrow` — centered `max-w-4xl` container
  - `.container-wide` — centered `max-w-7xl` container
- No test framework is present; PRs must pass `npm run lint` and `npx tsc --noEmit` cleanly.
- Keep migrations additive; never alter or delete an existing migration file. Name new migrations with a sequential 3-digit prefix: `NNN_description.sql`. The current highest migration is `007`, so the next file must be `008_description.sql`. Note: migration files 004–006 are absent from the `migrations/` directory (the sequence jumps from `003` to `007`) — this is intentional, do not attempt to fill the gap.

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
