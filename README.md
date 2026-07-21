# Noon Capital DApp Interface

Multichain Web3 protocol frontend built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Redux Toolkit, and wagmi/viem.

## Stack

| Layer      | Choice                                                              |
| ---------- | ------------------------------------------------------------------- |
| Framework  | React 19 + TypeScript + Vite                                        |
| Styling    | Tailwind CSS v4 + shadcn/ui (New York)                              |
| Motion     | `motion` (ready for motion-primitives / Aceternity)                 |
| State      | Redux Toolkit + React Query                                         |
| Web3       | wagmi + viem (Ethereum, Arbitrum, Base, Optimism, Polygon, Sepolia) |
| Routing    | React Router                                                        |
| Validation | Zod (env)                                                           |
| Quality    | ESLint + Prettier + Husky + lint-staged + commitlint + Vitest       |
| CI         | GitHub Actions + Dependabot                                         |

## Requirements

- Node.js **22+** (see `.nvmrc`)
- Any of: **npm**, **Yarn**, **pnpm**, or **Bun**

`package-lock.json` is the **canonical lockfile** used in CI. Other lockfiles are gitignored so PRs don’t fight over managers — use whichever tool you prefer locally.

## Getting started

```bash
cp .env.example .env
```

Install with your preferred manager:

```bash
# npm
npm install
npm run dev

# Yarn
yarn
yarn dev

# pnpm
pnpm install
pnpm dev

# Bun
bun install
bun run dev
```

Set `VITE_WALLETCONNECT_PROJECT_ID` in `.env` for WalletConnect (optional — injected wallets work without it).

## Scripts

Scripts are manager-agnostic (`dev`, `build`, `lint`, `test`, `check`, …). Run them as `npm run <script>`, `yarn <script>`, `pnpm <script>`, or `bun run <script>`.

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `dev`           | Start local dev server                   |
| `build`         | Typecheck + production build             |
| `lint`          | Run ESLint (includes import order)       |
| `format`        | Format with Prettier                     |
| `typecheck`     | TypeScript project build check           |
| `test`          | Run Vitest unit tests                    |
| `test:coverage` | Unit tests with coverage                 |
| `check`         | format + lint + typecheck + test + build |

## Quality gates

| Hook / CI      | What it enforces                                   |
| -------------- | -------------------------------------------------- |
| pre-commit     | lint-staged (ESLint + Prettier)                    |
| commit-msg     | Conventional Commits (commitlint)                  |
| pre-push       | typecheck + unit tests                             |
| GitHub Actions | format, lint, typecheck, tests, build, `npm audit` |
| Dependabot     | weekly npm + Actions dependency PRs                |

Commit examples:

```text
feat: add vault deposit flow
fix: correct chain switch toast
chore: bump wagmi
```

## Import order

ESLint enforces:

1. Node / core (`node:`)
2. React (`react`, `react-dom`)
3. Third-party packages
4. Local (`@/…`, then relative)
5. Side-effect imports (CSS)

## Project structure

```text
src/
  app/              # Router and app-level wiring
  assets/svgs/      # React SVG components
  components/
    ui/             # shadcn primitives
    common/         # Shared UI (theme toggle, error boundary)
    layout/         # Shell / header / footer
    web3/           # Connect button, chain switcher
    motion/         # Motion primitives
  constants/        # Routes, storage keys, app meta
  contexts/         # React context definitions
  features/         # Domain modules (markets, vaults, …)
  hooks/            # Shared hooks (+ hooks/web3)
  lib/              # utils, env, web3 config/abis/chains
  pages/            # Route-level screens
  providers/        # Theme, Web3, Redux composition
  store/            # Redux store + slices
  styles/           # Global CSS / design tokens
  test/             # Test setup + helpers
  types/            # Shared TypeScript types
docs/
  ARCHITECTURE.md   # State / feature conventions
```

## Adding shadcn components

```bash
npx shadcn@latest add <component>
```

Configured via `components.json` with `@/` path aliases.

## Extending for protocol work

1. Add ABIs under `src/lib/web3/abis/`
2. Add feature modules under `src/features/<domain>/`
3. Prefer React Query for server/chain reads; Redux for cross-route UI + portfolio state
4. Keep wallet UI in `components/web3` and reusable chain logic in `hooks/web3`
5. See `docs/ARCHITECTURE.md` for state ownership rules

## Security notes

- Never commit `.env` or private keys / mnemonics
- Review new dependencies before merging Dependabot PRs
- Prefer `npm ci` in CI and clean installs from the lockfile
- `npm audit` runs in CI at high severity
