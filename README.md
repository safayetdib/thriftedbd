# thriftedBD

Online thrifted/secondhand clothing storefront and admin dashboard for thriftedBD, built with Next.js.

See [`AGENTS.md`](./AGENTS.md) for Next.js version-specific notes, and the project root's `thriftedBD-design-system.md` for design tokens and component specs.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm format` | Format with Prettier |
| `pnpm format:check` | Check formatting without writing |
| `pnpm typecheck` | Run the TypeScript compiler with no emit |

Pre-commit (Husky + lint-staged) auto-fixes and formats staged files. Pre-push runs a full typecheck + lint.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · MongoDB Atlas · Cloudflare R2 · NextAuth.
