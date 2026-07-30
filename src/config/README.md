# Protocol chain configs

Per-chain Noon deployment data (contracts, tokens, pools, explorers, gas limits).

```text
src/config/
  chains/          # One file per network + registry maps
  address.ts       # Shared `0x${string}` address type
  chain-id.ts      # Protocol map keys (incl. Sui / Starknet ids)
  points-api.ts    # Points API chain enum
  pools.ts         # UniV3 / UniV4 / Curve pool shapes
  token.ts         # Token metadata
  types.ts         # ProtocolChainConfig
  helpers.ts       # getToken / getUniV3Pool / …
  vault.ts         # Vault metadata helpers
```

## vs `src/chains/`

| Path          | Responsibility                                      |
| ------------- | --------------------------------------------------- |
| `src/chains/` | Wallet / RPC / AppKit network metadata (`ChainKey`) |
| `src/config/` | Protocol deployments keyed by numeric chain id      |

Import protocol data from `@/config` (or `@/config/chains/<name>`). Prefer ABIs from `@/lib/abis`.
