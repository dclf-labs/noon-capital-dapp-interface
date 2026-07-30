/**
 * Environment validation and grouped runtime config (`appEnv`).
 *
 * Prefer `appEnv` everywhere in app code. Do not read `import.meta.env.VITE_*`
 * outside this module (except `index.html` for GA injection).
 *
 * @see `.env.example` for canonical keys and legacy aliases
 * @see `./README.md` for usage patterns
 */
import { z } from 'zod'

import type { HoldingsSubgraphChain } from '@/config/types'

const optionalString = z.string().optional().default('')

/**
 * Canonical Vite env keys after legacy alias normalization.
 */
export const envSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  DEV: z.boolean(),
  PROD: z.boolean(),
  SSR: z.boolean(),
  BASE_URL: z.string(),

  /** App stage (distinct from Vite `MODE`). */
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),

  /** Noon backend API base URL. */
  VITE_API_BASE_URL: optionalString,

  /** Reown / WalletConnect project id (required in production). */
  VITE_WALLETCONNECT_PROJECT_ID: optionalString,

  /** Google Analytics measurement id (injected via `index.html`). */
  VITE_GA_MEASUREMENT_ID: optionalString,
  /** Mixpanel project token. */
  VITE_MIXPANEL_TOKEN: optionalString,

  /** Explicit Starknet JSON-RPC URL (wins over Alchemy). */
  VITE_STARKNET_RPC_URL: optionalString,
  /** Alchemy API key → builds Starknet mainnet RPC when no explicit URL. */
  VITE_STARKNET_ALCHEMY_API_KEY: optionalString,
  /** Explicit Sui RPC URL. */
  VITE_SUI_RPC_URL: optionalString,

  VITE_SUBGRAPH_USN_ETHEREUM_URL: optionalString,
  VITE_SUBGRAPH_SUSN_ETHEREUM_URL: optionalString,
  VITE_SUBGRAPH_USN_SOPHON_URL: optionalString,
  VITE_SUBGRAPH_SUSN_SOPHON_URL: optionalString,
  VITE_SUBGRAPH_USN_ZKSYNC_URL: optionalString,
  VITE_SUBGRAPH_SUSN_ZKSYNC_URL: optionalString,
  VITE_SUBGRAPH_USN_TAC_URL: optionalString,
  VITE_SUBGRAPH_SUSN_TAC_URL: optionalString,
  VITE_SUBGRAPH_ETH_META_URL: optionalString,
})

export type AppEnvRaw = z.infer<typeof envSchema>

/** Re-export for callers that already import from `@/lib/env`. */
export type { HoldingsSubgraphChain }

type RawRecord = Record<string, unknown>

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

/**
 * Map legacy env names → canonical keys so older `.env` files keep working.
 * Canonical wins when both are set.
 */
export function normalizeRawEnv(raw: RawRecord): RawRecord {
  return {
    ...raw,
    VITE_API_BASE_URL: firstString(raw.VITE_API_BASE_URL, raw.VITE_APP_API_BASE_URL),
    VITE_WALLETCONNECT_PROJECT_ID: firstString(
      raw.VITE_WALLETCONNECT_PROJECT_ID,
      raw.VITE_APP_WALLET_CONNECT_PROJECT_ID,
    ),
    VITE_MIXPANEL_TOKEN: firstString(raw.VITE_MIXPANEL_TOKEN, raw.VITE_APP_MIXPANEL_TOKEN),
    VITE_STARKNET_ALCHEMY_API_KEY: firstString(
      raw.VITE_STARKNET_ALCHEMY_API_KEY,
      raw.VITE_APP_STARKNET_ALCHEMY_API_KEY,
    ),
    VITE_SUBGRAPH_USN_ETHEREUM_URL: firstString(
      raw.VITE_SUBGRAPH_USN_ETHEREUM_URL,
      raw.VITE_APP_GOLDSKY_USN_MAINNET_URL,
    ),
    VITE_SUBGRAPH_SUSN_ETHEREUM_URL: firstString(
      raw.VITE_SUBGRAPH_SUSN_ETHEREUM_URL,
      raw.VITE_APP_GOLDSKY_SUSN_MAINNET_URL,
    ),
    VITE_SUBGRAPH_USN_SOPHON_URL: firstString(
      raw.VITE_SUBGRAPH_USN_SOPHON_URL,
      raw.VITE_APP_GOLDSKY_USN_SOPHON_URL,
    ),
    VITE_SUBGRAPH_SUSN_SOPHON_URL: firstString(
      raw.VITE_SUBGRAPH_SUSN_SOPHON_URL,
      raw.VITE_APP_GOLDSKY_SUSN_SOPHON_URL,
    ),
    VITE_SUBGRAPH_USN_ZKSYNC_URL: firstString(
      raw.VITE_SUBGRAPH_USN_ZKSYNC_URL,
      raw.VITE_APP_GOLDSKY_USN_ZKSYNC_URL,
    ),
    VITE_SUBGRAPH_SUSN_ZKSYNC_URL: firstString(
      raw.VITE_SUBGRAPH_SUSN_ZKSYNC_URL,
      raw.VITE_APP_GOLDSKY_SUSN_ZKSYNC_URL,
    ),
    VITE_SUBGRAPH_USN_TAC_URL: firstString(
      raw.VITE_SUBGRAPH_USN_TAC_URL,
      raw.VITE_APP_GOLDSKY_USN_TAC_URL,
    ),
    VITE_SUBGRAPH_SUSN_TAC_URL: firstString(
      raw.VITE_SUBGRAPH_SUSN_TAC_URL,
      raw.VITE_APP_GOLDSKY_SUSN_TAC_URL,
    ),
    VITE_SUBGRAPH_ETH_META_URL: firstString(
      raw.VITE_SUBGRAPH_ETH_META_URL,
      raw.VITE_APP_ETH_META_SUBGRAPH_URL,
    ),
  }
}

export function parseEnv(input: unknown): AppEnvRaw {
  const normalized = normalizeRawEnv((input ?? {}) as RawRecord)
  const parsed = envSchema.safeParse(normalized)

  if (!parsed.success) {
    console.error('Invalid environment variables', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment configuration. Check .env against .env.example.')
  }

  return parsed.data
}

const DEFAULT_STARKNET_RPC = 'https://starknet-mainnet.public.blastapi.io/rpc/v0_8'
export const DEFAULT_SUI_RPC_URL = 'https://fullnode.mainnet.sui.io:443'

function buildStarknetRpcUrl(raw: AppEnvRaw): string {
  if (raw.VITE_STARKNET_RPC_URL) return raw.VITE_STARKNET_RPC_URL
  if (raw.VITE_STARKNET_ALCHEMY_API_KEY) {
    return `https://starknet-mainnet.g.alchemy.com/v2/${raw.VITE_STARKNET_ALCHEMY_API_KEY}`
  }
  return DEFAULT_STARKNET_RPC
}

/**
 * Build the grouped runtime config used by app code.
 *
 * @example
 * ```ts
 * import { appEnv } from '@/lib/env'
 * fetch(`${appEnv.api.baseUrl}/api/v1/…`)
 * ```
 */
export function createAppEnv(raw: AppEnvRaw) {
  return {
    mode: raw.MODE,
    isDev: raw.DEV,
    isProd: raw.PROD,
    isSsr: raw.SSR,
    baseUrl: raw.BASE_URL,
    stage: raw.VITE_APP_ENV,

    api: {
      /** Trailing slash stripped. Empty when unset. */
      baseUrl: raw.VITE_API_BASE_URL.replace(/\/$/, ''),
    },

    walletConnect: {
      projectId: raw.VITE_WALLETCONNECT_PROJECT_ID,
    },

    analytics: {
      gaMeasurementId: raw.VITE_GA_MEASUREMENT_ID,
      mixpanelToken: raw.VITE_MIXPANEL_TOKEN,
    },

    rpc: {
      starknet: buildStarknetRpcUrl(raw),
      starknetAlchemyApiKey: raw.VITE_STARKNET_ALCHEMY_API_KEY,
      /** Empty when unset — callers fall back to protocol config / Mysten. */
      sui: raw.VITE_SUI_RPC_URL,
    },

    subgraphs: {
      ethMeta: raw.VITE_SUBGRAPH_ETH_META_URL,
      holdings: {
        ethereum: {
          usn: raw.VITE_SUBGRAPH_USN_ETHEREUM_URL,
          susn: raw.VITE_SUBGRAPH_SUSN_ETHEREUM_URL,
        },
        sophon: {
          usn: raw.VITE_SUBGRAPH_USN_SOPHON_URL,
          susn: raw.VITE_SUBGRAPH_SUSN_SOPHON_URL,
        },
        zksync: {
          usn: raw.VITE_SUBGRAPH_USN_ZKSYNC_URL,
          susn: raw.VITE_SUBGRAPH_SUSN_ZKSYNC_URL,
        },
        tac: {
          usn: raw.VITE_SUBGRAPH_USN_TAC_URL,
          susn: raw.VITE_SUBGRAPH_SUSN_TAC_URL,
        },
      } satisfies Record<HoldingsSubgraphChain, { usn: string; susn: string }>,
    },
  } as const
}

export type AppEnv = ReturnType<typeof createAppEnv>

/** Snapshot of `import.meta.env` (canonical + legacy) for `parseEnv`. */
function readImportMetaEnv(): RawRecord {
  const e = import.meta.env
  return {
    MODE: e.MODE,
    DEV: e.DEV,
    PROD: e.PROD,
    SSR: e.SSR,
    BASE_URL: e.BASE_URL,
    VITE_APP_ENV: e.VITE_APP_ENV || 'development',
    VITE_API_BASE_URL: e.VITE_API_BASE_URL,
    VITE_APP_API_BASE_URL: e.VITE_APP_API_BASE_URL,
    VITE_WALLETCONNECT_PROJECT_ID: e.VITE_WALLETCONNECT_PROJECT_ID,
    VITE_APP_WALLET_CONNECT_PROJECT_ID: e.VITE_APP_WALLET_CONNECT_PROJECT_ID,
    VITE_GA_MEASUREMENT_ID: e.VITE_GA_MEASUREMENT_ID,
    VITE_MIXPANEL_TOKEN: e.VITE_MIXPANEL_TOKEN,
    VITE_APP_MIXPANEL_TOKEN: e.VITE_APP_MIXPANEL_TOKEN,
    VITE_STARKNET_RPC_URL: e.VITE_STARKNET_RPC_URL,
    VITE_STARKNET_ALCHEMY_API_KEY: e.VITE_STARKNET_ALCHEMY_API_KEY,
    VITE_APP_STARKNET_ALCHEMY_API_KEY: e.VITE_APP_STARKNET_ALCHEMY_API_KEY,
    VITE_SUI_RPC_URL: e.VITE_SUI_RPC_URL,
    VITE_SUBGRAPH_USN_ETHEREUM_URL: e.VITE_SUBGRAPH_USN_ETHEREUM_URL,
    VITE_SUBGRAPH_SUSN_ETHEREUM_URL: e.VITE_SUBGRAPH_SUSN_ETHEREUM_URL,
    VITE_SUBGRAPH_USN_SOPHON_URL: e.VITE_SUBGRAPH_USN_SOPHON_URL,
    VITE_SUBGRAPH_SUSN_SOPHON_URL: e.VITE_SUBGRAPH_SUSN_SOPHON_URL,
    VITE_SUBGRAPH_USN_ZKSYNC_URL: e.VITE_SUBGRAPH_USN_ZKSYNC_URL,
    VITE_SUBGRAPH_SUSN_ZKSYNC_URL: e.VITE_SUBGRAPH_SUSN_ZKSYNC_URL,
    VITE_SUBGRAPH_USN_TAC_URL: e.VITE_SUBGRAPH_USN_TAC_URL,
    VITE_SUBGRAPH_SUSN_TAC_URL: e.VITE_SUBGRAPH_SUSN_TAC_URL,
    VITE_SUBGRAPH_ETH_META_URL: e.VITE_SUBGRAPH_ETH_META_URL,
    VITE_APP_GOLDSKY_USN_MAINNET_URL: e.VITE_APP_GOLDSKY_USN_MAINNET_URL,
    VITE_APP_GOLDSKY_SUSN_MAINNET_URL: e.VITE_APP_GOLDSKY_SUSN_MAINNET_URL,
    VITE_APP_GOLDSKY_USN_SOPHON_URL: e.VITE_APP_GOLDSKY_USN_SOPHON_URL,
    VITE_APP_GOLDSKY_SUSN_SOPHON_URL: e.VITE_APP_GOLDSKY_SUSN_SOPHON_URL,
    VITE_APP_GOLDSKY_USN_ZKSYNC_URL: e.VITE_APP_GOLDSKY_USN_ZKSYNC_URL,
    VITE_APP_GOLDSKY_SUSN_ZKSYNC_URL: e.VITE_APP_GOLDSKY_SUSN_ZKSYNC_URL,
    VITE_APP_GOLDSKY_USN_TAC_URL: e.VITE_APP_GOLDSKY_USN_TAC_URL,
    VITE_APP_GOLDSKY_SUSN_TAC_URL: e.VITE_APP_GOLDSKY_SUSN_TAC_URL,
    VITE_APP_ETH_META_SUBGRAPH_URL: e.VITE_APP_ETH_META_SUBGRAPH_URL,
  }
}

const rawEnv = parseEnv(readImportMetaEnv())

/** Parsed flat env (canonical keys). Prefer `appEnv` in feature code. */
export const env = rawEnv

/** Grouped runtime config — primary API for the rest of the app. */
export const appEnv = createAppEnv(rawEnv)

export const isProd = appEnv.isProd
export const isDev = appEnv.isDev
