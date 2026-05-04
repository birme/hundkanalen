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
- Auth guards: call `await requireAdmin()` (or `requireGuest()`) at the very top of each handler; if it returns `null`, immediately `return Response.json({ error: 'Unauthorized' }, { status: 401 })`.
- Database access: call `getDb()` inside each handler to get the tagged-template `sql` client (`import { getDb } from '@/lib/db'`). Do not import a module-level `sql` singleton.
- Tailwind utility classes only — no inline `style=` props. Custom component classes (`.btn-primary`, etc.) are defined in `src/app/globals.css`.
- No test framework is present; PRs must pass `npm run lint` and `npx tsc --noEmit` cleanly.
- Keep migrations additive; never alter or delete an existing migration file. Name new migrations with a sequential 3-digit prefix: `NNN_description.sql`.

## Shared utilities (`src/lib/utils.ts`)

| Function | Purpose |
|---|---|
| `formatSEK(amount)` | Format a number as Swedish krona (SEK) |
| `formatDate(date)` | Long Swedish date string (e.g. "4 maj 2026") |
| `formatDateShort(date)` | Short Swedish date string (YYYY-MM-DD) |
| `daysBetween(start, end)` | Number of days between two dates |
| `classNames(...classes)` | Conditionally join Tailwind class strings |

Use these instead of reimplementing equivalent logic.

## Deployment

Deployed on Vercel (inferred from `.vercel` in `.gitignore`). Environment variables required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and any Nodemailer SMTP vars.

## Agent team

| Agent | Role |
|---|---|
| `developer` | Implements sub-tickets end-to-end, opens a PR, stops |
| `reviewer` | Reviews the PR diff against acceptance criteria, posts a single verdict comment |
