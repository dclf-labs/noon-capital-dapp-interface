/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

/**
 * Vite `import.meta.env` typings.
 * Runtime validation and grouping live in `src/lib/env` (`appEnv`).
 * Prefer `appEnv` in app code — do not scatter `import.meta.env.VITE_*` reads.
 */
interface ImportMetaEnv {
  // ── Canonical (see .env.example) ──────────────────────────────────────────
  readonly VITE_API_BASE_URL: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_GA_MEASUREMENT_ID: string
  readonly VITE_STARKNET_RPC_URL: string
  readonly VITE_STARKNET_ALCHEMY_API_KEY: string
  readonly VITE_ETHEREUM_RPC_URL: string
  readonly VITE_BASE_RPC_URL: string
  readonly VITE_SUI_RPC_URL: string
  readonly VITE_TAC_RPC_URL: string
  readonly VITE_ZKSYNC_RPC_URL: string
  readonly VITE_SOPHON_RPC_URL: string
  readonly VITE_BERACHAIN_RPC_URL: string
  readonly VITE_CITREA_RPC_URL: string
  readonly VITE_HYPEREVM_RPC_URL: string
  readonly VITE_MONAD_RPC_URL: string

  // ── Alternate names (normalized in src/lib/env) ───────────────────────────
  readonly VITE_APP_API_BASE_URL: string
  readonly VITE_APP_WALLET_CONNECT_PROJECT_ID: string
  readonly VITE_APP_STARKNET_ALCHEMY_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
