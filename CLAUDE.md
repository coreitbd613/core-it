# CLAUDE.md

## What this is
`core-it` is the company's own complete CRM and ERP software product — not a client project, not just a marketing site. The current auth (login/signup/admin) and `(admin)` route group are early scaffolding for a larger system. Expect scope to grow into typical CRM/ERP modules: contacts/leads, sales pipeline, inventory, invoicing, HR, reporting/dashboards, role-based permissions, etc. Favor data models and UI patterns that scale to that rather than one-off features.

## Design direction
Target aesthetic is premium, high-quality, minimal — Stripe's marketing site is the explicit reference bar. Restraint is the differentiator, not any specific color: one accent used deliberately in a couple of places beats repeating pill-badges/icons and applying the accent everywhere at once.

- Orange (`--primary: #FD6005`) is the single primary/action color — it's the literal color of the Core IT logo, so it stays for CTAs/buttons and shouldn't be swapped.
- A secondary navy/blue (roughly complementary to orange) is proposed for supporting/illustrative use only (dark-section backgrounds, gradients, icon accents) — never competing with orange for primary actions. Not yet formalized into `globals.css` tokens.
- Prefer real screenshots/recordings of actual Core IT work (in device mockups) over generic stock GIFs/video for "premium" visual content — ask whether real project assets exist before reaching for stock.
- Base radius `--radius: 0.5rem` → use `rounded-lg` to match existing buttons/cards.

## Working style
- Never run `pnpm dev`, `tsc --noEmit`, or `pnpm lint` proactively as a self-verification step — the user runs and checks the dev server themselves. Only run these if explicitly asked, or when reporting a finished task if the user requests verification.
- Package manager is pnpm only, everywhere in this repo (`frontend/` and `backend/`) — never npm or yarn, even if a lockfile or package.json suggests otherwise.

## Component placement (frontend)
- `app/<route>/_components/` — component used only by that route (and its children). The underscore prefix opts the folder out of Next.js routing.
- `frontend/components/shared/` — component used by 2+ unrelated routes.
- `frontend/components/ui/` — shadcn/Magic UI primitives (button, card, input, etc.) — untouched by the above.

See `AGENTS.md` for environment/tooling facts (dev commands, config quirks, git identity).
