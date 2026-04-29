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
- API routes live under `src/app/api/`. Each route file exports named HTTP-method handlers (`GET`, `POST`, etc.).
- Auth guards: use `src/lib/admin-auth.ts` for admin routes and `src/lib/guest-auth.ts` for guest routes.
- Database access goes through the global pool in `src/lib/db.ts`; import `sql` from there.
- Tailwind utility classes only — no inline `style=` props. Custom component classes (`.btn-primary`, etc.) are defined in `src/app/globals.css`.
- No test framework is present; PRs must pass `npm run lint` and `npx tsc --noEmit` cleanly.
- Keep migrations additive; never alter or delete an existing migration file.

## Deployment

Deployed on Vercel (inferred from `.vercel` in `.gitignore`). Environment variables required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and any Nodemailer SMTP vars.

## Agent team

| Agent | Role |
|---|---|
| `developer` | Implements sub-tickets end-to-end, opens a PR, stops |
| `reviewer` | Reviews the PR diff against acceptance criteria, posts a single verdict comment |
