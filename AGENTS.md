# AGENTS.md

- App lives in `frontend/` (Next.js 16 + Turbopack + Tailwind v4 + shadcn). Root-level files are just tooling (skills CLI, MCP config) — not part of the app.
- Package manager: **pnpm** (`frontend/pnpm-lock.yaml`). Don't use npm/yarn there.
- Run dev server: `cd frontend && pnpm dev` (or `build` / `start` / `lint`).
- shadcn registries configured in `frontend/components.json`: `@shadcnblocks` and `@magicui` (Magic UI components installed via `npx shadcn@latest add @magicui/<slug>`).
- Brand color: `--primary: #FD6005` (orange). Base radius: `--radius: 0.625rem` → use `rounded-lg` to match existing buttons/cards.
- `frontend/next.config.ts` sets `turbopack.root` explicitly — needed because a root-level `package-lock.json`/pnpm files otherwise confuse Turbopack's workspace-root detection.
- Git commits in this repo use identity `Core IT <coreitbd613@gmail.com>` (repo-local `git config`), matching the GitHub account (`coreitbd613`) Vercel deploys are tied to — don't let it fall back to a personal git identity.
