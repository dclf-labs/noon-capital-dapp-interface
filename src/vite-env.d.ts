/// <reference types="vite/client" />

/**
 * Vite `import.meta.env` typings.
 * Runtime validation and grouping live in `src/lib/env` (`appEnv`).
 * Prefer `appEnv` in app code — do not scatter `import.meta.env.VITE_*` reads.
 */
interface ImportMetaEnv {
  // ── Canonical (see .env.example) ──────────────────────────────────────────
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'
  readonly VITE_API_BASE_URL: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_GA_MEASUREMENT_ID: string
  readonly VITE_MIXPANEL_TOKEN: string
  readonly VITE_STARKNET_RPC_URL: string
  readonly VITE_STARKNET_ALCHEMY_API_KEY: string
  readonly VITE_SUI_RPC_URL: string
  readonly VITE_SUBGRAPH_USN_ETHEREUM_URL: string
  readonly VITE_SUBGRAPH_SUSN_ETHEREUM_URL: string
  readonly VITE_SUBGRAPH_USN_SOPHON_URL: string
  readonly VITE_SUBGRAPH_SUSN_SOPHON_URL: string
  readonly VITE_SUBGRAPH_USN_ZKSYNC_URL: string
  readonly VITE_SUBGRAPH_SUSN_ZKSYNC_URL: string
  readonly VITE_SUBGRAPH_USN_TAC_URL: string
  readonly VITE_SUBGRAPH_SUSN_TAC_URL: string
  readonly VITE_SUBGRAPH_ETH_META_URL: string

  // ── Legacy aliases (normalized in src/lib/env; prefer canonical above) ────
  readonly VITE_APP_API_BASE_URL: string
  readonly VITE_APP_WALLET_CONNECT_PROJECT_ID: string
  readonly VITE_APP_MIXPANEL_TOKEN: string
  readonly VITE_APP_STARKNET_ALCHEMY_API_KEY: string
  readonly VITE_APP_GOLDSKY_USN_MAINNET_URL: string
  readonly VITE_APP_GOLDSKY_SUSN_MAINNET_URL: string
  readonly VITE_APP_GOLDSKY_USN_SOPHON_URL: string
  readonly VITE_APP_GOLDSKY_SUSN_SOPHON_URL: string
  readonly VITE_APP_GOLDSKY_USN_ZKSYNC_URL: string
  readonly VITE_APP_GOLDSKY_SUSN_ZKSYNC_URL: string
  readonly VITE_APP_GOLDSKY_USN_TAC_URL: string
  readonly VITE_APP_GOLDSKY_SUSN_TAC_URL: string
  readonly VITE_APP_ETH_META_SUBGRAPH_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
