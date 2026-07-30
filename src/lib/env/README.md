# Environment (`appEnv`)

Validated Vite env lives in [`index.ts`](./index.ts). Feature code should import **`appEnv`**, not `import.meta.env`.

## Quick reference

```ts
import { appEnv } from '@/lib/env'

appEnv.api.baseUrl // Noon backend (no trailing slash)
appEnv.walletConnect.projectId // Reown / WalletConnect
appEnv.rpc.starknet // resolved Starknet RPC
appEnv.rpc.sui // optional Sui RPC override (may be '')
appEnv.subgraphs.holdings.ethereum.usn
appEnv.analytics.mixpanelToken
appEnv.stage // development | staging | production
```

## Adding a variable

1. Add the canonical `VITE_*` key to `.env.example` (with a short comment).
2. Extend `envSchema` + `readImportMetaEnv()` in `index.ts`.
3. Expose it on `createAppEnv()` under a grouped field (`api`, `rpc`, `subgraphs`, …).
4. Update `src/vite-env.d.ts`, README, and `docs/ARCHITECTURE.md`.
5. If migrating an old name, map it in `normalizeRawEnv` and document the alias in `.env.example`.

## Related

| Module                                                                       | Role                                                                  |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [`../subgraph.ts`](../subgraph.ts)                                           | Resolve holdings / meta subgraph URLs from `appEnv` + protocol config |
| [`../../features/api/lib/api-fetch.ts`](../../features/api/lib/api-fetch.ts) | Typed fetch against `appEnv.api.baseUrl`                              |
| [`../../wallet/evm/projectId.ts`](../../wallet/evm/projectId.ts)             | Fail-closed WalletConnect id in production                            |
| [`../../hooks/connection/README.md`](../../hooks/connection/README.md)       | Wallet session API                                                    |

## Tests

- `index.test.ts` — schema parse, legacy alias normalize, `createAppEnv`
- `../subgraph.test.ts` — holdings URL resolution via `holdingsSubgraphChain`

## Security

All `VITE_*` values ship in the browser bundle. Never put private keys or privileged secrets here. Restrict third-party keys by HTTP referrer / domain when the provider allows it.
