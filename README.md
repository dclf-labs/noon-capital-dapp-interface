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

Copy `.env.example` → `.env`. Prefer the **canonical** names below; legacy `VITE_APP_*` / `VITE_APP_GOLDSKY_*` aliases still work via `src/lib/env`.

App code should read **`appEnv`** (`src/lib/env`), not `import.meta.env` directly. See `src/lib/env/README.md`.

| Variable                                       | Required                        | Notes                                                                |
| ---------------------------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| `VITE_WALLETCONNECT_PROJECT_ID`                | **Yes** in production / deploys | https://dashboard.reown.com — empty fails closed at AppKit bootstrap |
| `VITE_API_BASE_URL`                            | Recommended                     | Noon backend (`https://back.noon.capital`)                           |
| `VITE_STARKNET_ALCHEMY_API_KEY`                | No                              | Builds Starknet Alchemy RPC when `VITE_STARKNET_RPC_URL` is unset    |
| `VITE_STARKNET_RPC_URL` / `VITE_SUI_RPC_URL`   | No                              | Explicit RPC overrides                                               |
| `VITE_SUBGRAPH_USN_*` / `VITE_SUBGRAPH_SUSN_*` | No                              | Holdings subgraphs by chain (`ethereum`, `sophon`, `zksync`, `tac`)  |
| `VITE_SUBGRAPH_ETH_META_URL`                   | No                              | Ethereum meta subgraph                                               |
| `VITE_MIXPANEL_TOKEN`                          | No                              | Mixpanel (reserved for analytics wiring)                             |
| `VITE_GA_MEASUREMENT_ID`                       | No                              | Injected into `index.html` only; omitted / empty disables analytics  |
| `VITE_APP_ENV`                                 | No (default `development`)      | `development` \| `staging` \| `production`                           |

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
  config/             # Protocol deployments (contracts, tokens, pools)
  features/           # Domain modules (hooks + providers + libs co-located)
    _shared/          # Trade form controller + session reset
  hooks/
    connection/       # useWalletSession / read-only / WalletQuerySync
    on-chain/         # balances, allowances, gas
    query/            # useChainQuery / useApiQuery
    ui/               # debounce, etc.
  state/              # Zustand (active chain, points estimator)
  components/
    wallet/           # Wallet connect / status UI
  constants/          # App meta + route + UI constants
  lib/
    env/              # Zod → appEnv
    wallet-session.ts # Session builders + canWriteSession
    query-keys.ts     # TanStack key factory
    evm-submit.ts     # Shared EVM writes
    abis/             # Contract ABIs
  providers/          # AppProviders (+ WalletQuerySync)
  styles/             # Global CSS / design tokens
  test/               # Test setup + helpers
  wallet/
    evm/              # AppKit + wagmi
    starknet/         # starknet-react
    sui/              # dApp Kit
docs/
  ARCHITECTURE.md     # State / session / feature conventions
```

See `src/features/README.md` and `docs/ARCHITECTURE.md` for conventions.

## Extending for protocol work

1. Keep chain metadata in `src/chains/`
2. Add / update protocol deployments under `src/config/chains/` — see `src/config/README.md`
3. Add ABIs under `src/lib/abis/` (`evm/` Solidity, `starknet/` Cairo) — see `src/lib/abis/README.md`
4. Add feature modules under `src/features/<domain>/` — reuse `useChainQuery` / `useApiQuery` / `queryKeys`
5. Wire wallet sessions via `useWalletSession` / family helpers; gate writes with `canWriteSession`
6. Trade UIs: `useTradeFormController` + `useResetOnSessionChange`
7. Prefer React Query for server/chain reads; keep wallet UI in `components/wallet`
8. See `docs/ARCHITECTURE.md` and `src/features/README.md` for conventions

## Security notes

- Never commit `.env` or private keys / mnemonics
- All `VITE_*` values are embedded in the client bundle — treat them as public
- Review new dependencies before merging Dependabot PRs
- Prefer `npm ci` in CI and clean installs from the lockfile
- `npm audit` runs in CI at **moderate** severity (matches `.npmrc`)
- See `SECURITY.md` for reporting and deploy env requirements
