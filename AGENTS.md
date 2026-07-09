# AGENTS.md

See `CLAUDE.md` for project overview, design direction, and working-style preferences. This file is environment/tooling facts only.

- App lives in `frontend/` (Next.js 16 + Turbopack + Tailwind v4 + shadcn). Root-level files are just tooling (skills CLI, MCP config) — not part of the app.
- Package manager: **pnpm** (`frontend/pnpm-lock.yaml`). Don't use npm/yarn there.
- Run dev server: `cd frontend && pnpm dev` (or `build` / `start` / `lint`).
- shadcn registries configured in `frontend/components.json`: `@shadcnblocks` and `@magicui` (Magic UI components installed via `npx shadcn@latest add @magicui/<slug>`).
- Brand color: `--primary: #FD6005` (orange). Base radius: `--radius: 0.5rem` → use `rounded-lg` to match existing buttons/cards.
- `frontend/next.config.ts` sets `turbopack.root` explicitly — needed because a root-level `package-lock.json`/pnpm files otherwise confuse Turbopack's workspace-root detection.
- Git commits in this repo use identity `Core IT <coreitbd613@gmail.com>` (repo-local `git config`), matching the GitHub account (`coreitbd613`) Vercel deploys are tied to — don't let it fall back to a personal git identity.
- Deployment/infra: frontend deploys to **Vercel**; backend runs on an **Azure VPS**; database is **Azure PostgreSQL**; file/object storage is **Azure Storage**.
- Component placement: route-only components go in `app/<route>/_components/` (underscore prefix opts out of Next.js routing); components used by 2+ unrelated routes go in `frontend/components/shared/`; shadcn/Magic UI primitives stay in `frontend/components/ui/`.
- Versions here are intentionally current: React `19.2.x`, Next.js `16.2.x` — likely newer than most models' training data. Don't default to older/deprecated patterns (e.g. `forwardRef`, manual "latest value" ref hacks instead of `useEffectEvent`, pre-Activity component patterns for hidden/keep-alive UI). If unsure whether an API or pattern is current, check react.dev / nextjs.org docs or web search before implementing rather than assuming from memory.
- Import React hooks as named imports (`import { useState, useEffect } from "react"`), not the `React.useState`/`React.useEffect` namespace style — this matches modern React convention. Keep `import * as React from "react"` alongside it only for type usages (`React.ComponentProps`, `React.ReactNode`, `React.CSSProperties`, etc.) and non-hook APIs (`React.createContext`).
