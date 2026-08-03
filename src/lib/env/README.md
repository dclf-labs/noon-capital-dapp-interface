# Environment (`appEnv`)

Validated Vite env lives in [`index.ts`](./index.ts). Feature code should import **`appEnv`**, not `import.meta.env`.

## Quick reference

```ts
import { appEnv } from '@/lib/env'

appEnv.api.baseUrl // Noon backend (no trailing slash)
appEnv.walletConnect.projectId // Reown / WalletConnect
appEnv.rpc.starknet // resolved Starknet RPC
appEnv.rpc.ethereum // optional protocol RPC override (may be '')
appEnv.analytics.gaMeasurementId // optional; also injected via index.html
```

## Variables we keep

| Key                                    | Why                                               |
| -------------------------------------- | ------------------------------------------------- |
| `VITE_API_BASE_URL`                    | Every backend API call                            |
| `VITE_WALLETCONNECT_PROJECT_ID`        | EVM AppKit (required in production)               |
| `VITE_STARKNET_INFURA_API_KEY`         | Starknet wallet + RPC (Infura)                    |
| `VITE_STARKNET_RPC_URL`                | Optional explicit Starknet RPC (wins over Infura) |
| `VITE_*_RPC_URL` (all protocol chains) | Optional RPC overrides; blank → public defaults   |
| `VITE_GA_MEASUREMENT_ID`               | Optional analytics (`index.html`)                 |

## Adding a variable

1. Add the canonical `VITE_*` key to `.env.example` (with a short comment).
2. Extend `envSchema` + `readImportMetaEnv()` in `index.ts`.
3. Expose it on `createAppEnv()` under a grouped field (`api`, `rpc`, …).
4. Update `src/vite-env.d.ts`, this README, and `docs/ARCHITECTURE.md`.
5. Only add an alternate name in `normalizeRawEnv` when you need to accept two env key spellings.

## Related

| Module                                                                       | Role                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------ |
| [`../../features/api/lib/api-fetch.ts`](../../features/api/lib/api-fetch.ts) | Typed fetch against `appEnv.api.baseUrl`   |
| [`../../wallet/evm/projectId.ts`](../../wallet/evm/projectId.ts)             | Fail-closed WalletConnect id in production |

## Tests

- `index.test.ts` — schema parse, alternate-name normalize, `createAppEnv`

## Security

All `VITE_*` values ship in the browser bundle. Never put private keys or privileged secrets here. Restrict third-party keys by HTTP referrer / domain when the provider allows it.
