# Noon Capital DApp Interface

Multichain wallet foundation for the Noon Capital protocol — React, TypeScript, Vite, and EVM / Starknet / Sui connectors.

## Stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Framework  | React 19 + TypeScript + Vite                                  |
| Styling    | Tailwind CSS v4 (UI kit / design system to be layered on)     |
| State      | TanStack Query (chain/server reads)                           |
| Web3       | EVM: AppKit + wagmi + viem + ethers · Starknet · Sui dApp Kit |
| Validation | Zod (env)                                                     |
| Quality    | ESLint + Prettier + Husky + lint-staged + commitlint + Vitest |
| CI         | GitHub Actions + Dependabot                                   |

## Requirements

- Node.js **22+** (see `.nvmrc`)
- Any of: **npm**, **Yarn**, **pnpm**, or **Bun**

`package-lock.json` is the **canonical lockfile** used in CI (`npm ci`). Other lockfiles are gitignored so PRs don’t fight over managers — use whichever tool you prefer locally.

Helper configs for alternate managers are committed intentionally:

- `.npmrc` — shared install hygiene (`engine-strict`, `legacy-peer-deps` for `@starknet-react/*` on React 19)
- `.yarnrc.yml` / `pnpm-workspace.yaml` — local manager settings (`pnpm-workspace.yaml` is an `allowBuilds` allowlist, **not** a monorepo workspace)

## Getting started

```bash
cp .env.example .env
```

Install with your preferred manager:

```bash
# npm (canonical for CI)
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

### Environment variables

| Variable                        | Required                        | Notes                                                                |
| ------------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| `VITE_WALLETCONNECT_PROJECT_ID` | **Yes** in production / deploys | https://dashboard.reown.com — empty fails closed at AppKit bootstrap |
| `VITE_GA_MEASUREMENT_ID`        | No                              | Injected into `index.html` only; omitted / empty disables analytics  |
| `VITE_APP_ENV`                  | No (default `development`)      | `development` \| `staging` \| `production`                           |

Set these in `.env` locally and in Vercel (or your host) for deploys. CI may use a placeholder WalletConnect id when the GitHub secret is unset — that is **not** enough for production.

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
| `test:coverage` | Unit tests with coverage thresholds      |
| `check`         | format + lint + typecheck + test + build |

## Quality gates

| Hook / CI      | What it enforces                                                     |
| -------------- | -------------------------------------------------------------------- |
| pre-commit     | lint-staged (ESLint + Prettier)                                      |
| commit-msg     | Conventional Commits (commitlint)                                    |
| pre-push       | typecheck + unit tests                                               |
| GitHub Actions | format, lint, typecheck, coverage (+ thresholds), build, `npm audit` |
| Dependabot     | weekly npm + Actions dependency PRs                                  |

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
  chains/             # Chain registry (EVM / Starknet / Sui metadata)
  components/
    wallet/           # Wallet connect / status UI
  constants/          # App meta + route constants
  lib/                # env (Zod), utils, shared query client, abis/
  providers/          # AppProviders composition
  styles/             # Global CSS / design tokens
  test/               # Test setup + helpers
  wallet/
    evm/              # AppKit + wagmi config, provider, readers, ethers
    starknet/         # starknet-react provider, reader, hooks
    sui/              # dApp Kit config, provider, reader
    types.ts          # Multi-chain client types
    readers.ts        # Cross-family ChainReader factory
    useMultiChainClient.ts
docs/
  ARCHITECTURE.md     # State / feature conventions
```

**Not installed yet** (add when product UI lands): `features/`, `pages/` (+ router), `components/ui/` (design system), client store only if cross-route UI needs it.

## Extending for protocol work

1. Keep chain metadata in `src/chains/`
2. Add ABIs under `src/lib/abis/` (`evm/` Solidity, `starknet/` Cairo) — see `src/lib/abis/README.md`
3. Add feature modules under `src/features/<domain>/` when product domains appear
4. Prefer React Query for server/chain reads; keep wallet UI in `components/wallet`
5. See `docs/ARCHITECTURE.md` for state ownership and Starknet balance notes

## Security notes

- Never commit `.env` or private keys / mnemonics
- All `VITE_*` values are embedded in the client bundle — treat them as public
- Review new dependencies before merging Dependabot PRs
- Prefer `npm ci` in CI and clean installs from the lockfile
- `npm audit` runs in CI at **moderate** severity (matches `.npmrc`)
- See `SECURITY.md` for reporting and deploy env requirements
