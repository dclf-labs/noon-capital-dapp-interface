# Environment (`appEnv`)

Validated Vite env lives in [`index.ts`](./index.ts). Feature code should import **`appEnv`**, not `import.meta.env`.

## Quick reference

```ts
import { appEnv } from '@/lib/env'

appEnv.api.baseUrl // Noon backend (no trailing slash)
appEnv.walletConnect.projectId // Reown / WalletConnect
appEnv.rpc.starknet // resolved Starknet RPC (URL / Infura / Blast)
appEnv.rpc.starknetInfuraApiKey // Infura project id (may be '')
appEnv.rpc.ethereum // optional protocol RPC override (may be '')
appEnv.analytics.gaMeasurementId // optional; also injected via index.html
```

## Variables

| Key                                    | Why                                                             |
| -------------------------------------- | --------------------------------------------------------------- |
| `VITE_API_BASE_URL`                    | Every backend API call                                          |
| `VITE_WALLETCONNECT_PROJECT_ID`        | EVM AppKit (required in production)                             |
| `VITE_STARKNET_INFURA_API_KEY`         | Builds Starknet Infura RPC when URL unset                       |
| `VITE_STARKNET_RPC_URL`                | Optional explicit Starknet RPC (wins over Infura key)           |
| `VITE_*_RPC_URL` (all protocol chains) | Optional RPC overrides; blank → public defaults in chain config |
| `VITE_GA_MEASUREMENT_ID`               | Optional analytics (`index.html`)                               |

## Starknet RPC resolution

`appEnv.rpc.starknet` is a single URL shared by:

- Starknet wallet provider (`src/wallet/starknet/provider.tsx` → `jsonRpcProvider`)
- Chain registry / protocol config (`src/chains`, `src/config/chains/starknet.ts`)

Priority:

1. `VITE_STARKNET_RPC_URL` (exact URL)
2. Infura key → `https://starknet-mainnet.infura.io/v3/<key>`
3. Public Blast fallback → `https://starknet-mainnet.public.blastapi.io/rpc/v0_8`

## Production CSP

Vercel ships a Content-Security-Policy in `vercel.json`. Any host used by `VITE_*_RPC_URL` / Infura / the Noon API must appear in `connect-src`, or production RPC calls fail in the browser. Local Vite does **not** enforce this header.

When you add a new RPC or third-party API host, update:

1. `.env.example` / README / this file
2. `vercel.json` `connect-src` (defaults include publicnode, Infura, Blast, Vesu, Accountable, TAC, Monad, Alchemy)
3. `src/lib/env/vercel-csp.test.ts` (allowlist regression)

## Adding a variable

1. Add the canonical `VITE_*` key to `.env.example` (with a short comment).
2. Extend `envSchema` + `readImportMetaEnv()` in `index.ts`.
3. Expose it on `createAppEnv()` under a grouped field (`api`, `rpc`, …).
4. Update `src/vite-env.d.ts`, this README, and `docs/ARCHITECTURE.md`.
5. If the value is an RPC/API origin used in production, allowlist it in `vercel.json`.

## Related

| Module                                                                       | Role                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------ |
| [`../../features/api/lib/api-fetch.ts`](../../features/api/lib/api-fetch.ts) | Typed fetch against `appEnv.api.baseUrl`   |
| [`../../wallet/evm/projectId.ts`](../../wallet/evm/projectId.ts)             | Fail-closed WalletConnect id in production |
| [`../../wallet/starknet/provider.tsx`](../../wallet/starknet/provider.tsx)   | Starknet-react `jsonRpcProvider`           |
| [`../../wallet/README.md`](../../wallet/README.md)                           | Wallet provider stack                      |

## Tests

- `index.test.ts` — schema parse, trim, Starknet URL builder
- `vercel-csp.test.ts` — production `connect-src` hosts

## Security

All `VITE_*` values ship in the browser bundle. Never put private keys or privileged secrets here. Restrict third-party keys by HTTP referrer / domain when the provider allows it.
