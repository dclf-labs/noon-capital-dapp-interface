# Wallet providers

Family-specific wallet SDKs mounted from `src/providers/AppProviders.tsx`:

| Family   | Provider                                 | Connect UX                       |
| -------- | ---------------------------------------- | -------------------------------- |
| EVM      | `evm/provider.tsx` (AppKit + wagmi)      | Reown AppKit modal               |
| Starknet | `starknet/provider.tsx` (starknet-react) | Branded `StarknetWalletSelector` |
| Sui      | `sui/provider.tsx` (Mysten dApp Kit)     | Mysten wallet modal              |

## Starknet RPC

`StarknetWalletProvider` uses **`jsonRpcProvider`** with `appEnv.rpc.starknet` — the same URL as chain registry / protocol config.

Resolution (see `src/lib/env`):

1. `VITE_STARKNET_RPC_URL`
2. Infura URL from `VITE_STARKNET_INFURA_API_KEY`
3. Public Blast fallback

Keep a single Starknet RPC for wallet and readers — do not introduce a second wallet-only provider.

## Connector icons

`connector-icon.ts` resolves badge URLs safely (Starknet `icon` getters can throw). Always pass the live connector through `resolveConnectorIconSrc(connector, chainFamily)` — never read `.icon` in JSX. Only `/…`, `https:`, and `data:image/…` sources are accepted.

## Related tests

- `connector-icon.test.ts`
- `../layout/shell-wallet-chrome.test.ts`
- `../lib/env/index.test.ts`
