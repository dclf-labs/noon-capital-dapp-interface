/**
 * Environment validation and grouped runtime config (`appEnv`).
 *
 * Prefer `appEnv` everywhere in app code. Do not read `import.meta.env.VITE_*`
 * outside this module (except `index.html` for GA injection).
 *
 * @see `.env.example` for keys
 * @see `./README.md` for usage patterns
 */
import { z } from 'zod'

const optionalString = z.string().optional().default('')

/**
 * Canonical Vite env keys.
 *
 * Kept intentionally small — only vars the app actually reads (or useful RPC overrides).
 */
export const envSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  DEV: z.boolean(),
  PROD: z.boolean(),
  SSR: z.boolean(),
  BASE_URL: z.string(),

  /** Noon backend API base URL. */
  VITE_API_BASE_URL: optionalString,

  /** Reown / WalletConnect project id (required in production). */
  VITE_WALLETCONNECT_PROJECT_ID: optionalString,

  /** Google Analytics measurement id (injected via `index.html`). */
  VITE_GA_MEASUREMENT_ID: optionalString,

  /** Explicit Starknet JSON-RPC URL (wins over Infura key). */
  VITE_STARKNET_RPC_URL: optionalString,
  /** Infura API key → builds Starknet mainnet RPC when no explicit URL. */
  VITE_STARKNET_INFURA_API_KEY: optionalString,

  /** Optional protocol RPC overrides (else public defaults in chain config). */
  VITE_ETHEREUM_RPC_URL: optionalString,
  VITE_BASE_RPC_URL: optionalString,
  VITE_SUI_RPC_URL: optionalString,
  VITE_TAC_RPC_URL: optionalString,
  VITE_ZKSYNC_RPC_URL: optionalString,
  VITE_SOPHON_RPC_URL: optionalString,
  VITE_BERACHAIN_RPC_URL: optionalString,
  VITE_CITREA_RPC_URL: optionalString,
  VITE_HYPEREVM_RPC_URL: optionalString,
  VITE_MONAD_RPC_URL: optionalString,
})

export type AppEnvRaw = z.infer<typeof envSchema>

type RawRecord = Record<string, unknown>

function trimString(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

/** Trim string env values before Zod parse. */
export function normalizeRawEnv(raw: RawRecord): RawRecord {
  const keys = [
    'VITE_API_BASE_URL',
    'VITE_WALLETCONNECT_PROJECT_ID',
    'VITE_GA_MEASUREMENT_ID',
    'VITE_STARKNET_RPC_URL',
    'VITE_STARKNET_INFURA_API_KEY',
    'VITE_ETHEREUM_RPC_URL',
    'VITE_BASE_RPC_URL',
    'VITE_SUI_RPC_URL',
    'VITE_TAC_RPC_URL',
    'VITE_ZKSYNC_RPC_URL',
    'VITE_SOPHON_RPC_URL',
    'VITE_BERACHAIN_RPC_URL',
    'VITE_CITREA_RPC_URL',
    'VITE_HYPEREVM_RPC_URL',
    'VITE_MONAD_RPC_URL',
  ] as const

  const next: RawRecord = { ...raw }
  for (const key of keys) {
    if (key in raw) next[key] = trimString(raw[key])
  }
  return next
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
  if (raw.VITE_STARKNET_INFURA_API_KEY) {
    return `https://starknet-mainnet.infura.io/v3/${raw.VITE_STARKNET_INFURA_API_KEY}`
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

    api: {
      /** Trailing slash stripped. Empty when unset. */
      baseUrl: raw.VITE_API_BASE_URL.replace(/\/$/, ''),
    },

    walletConnect: {
      projectId: raw.VITE_WALLETCONNECT_PROJECT_ID,
    },

    analytics: {
      gaMeasurementId: raw.VITE_GA_MEASUREMENT_ID,
    },

    rpc: {
      /**
       * Resolved Starknet JSON-RPC used by wallet (`jsonRpcProvider`), chain registry,
       * and protocol config. Order: explicit URL → Infura key URL → public Blast.
       */
      starknet: buildStarknetRpcUrl(raw),
      /** Infura project id used to build `rpc.starknet` when no explicit URL is set. */
      starknetInfuraApiKey: raw.VITE_STARKNET_INFURA_API_KEY,
      ethereum: raw.VITE_ETHEREUM_RPC_URL,
      base: raw.VITE_BASE_RPC_URL,
      /** Empty when unset — callers fall back to Mysten / protocol config. */
      sui: raw.VITE_SUI_RPC_URL,
      tac: raw.VITE_TAC_RPC_URL,
      zksync: raw.VITE_ZKSYNC_RPC_URL,
      sophon: raw.VITE_SOPHON_RPC_URL,
      berachain: raw.VITE_BERACHAIN_RPC_URL,
      citrea: raw.VITE_CITREA_RPC_URL,
      hyperevm: raw.VITE_HYPEREVM_RPC_URL,
      monad: raw.VITE_MONAD_RPC_URL,
    },
  } as const
}

export type AppEnv = ReturnType<typeof createAppEnv>

/** Snapshot of `import.meta.env` for `parseEnv`. */
function readImportMetaEnv(): RawRecord {
  const e = import.meta.env
  return {
    MODE: e.MODE,
    DEV: e.DEV,
    PROD: e.PROD,
    SSR: e.SSR,
    BASE_URL: e.BASE_URL,
    VITE_API_BASE_URL: e.VITE_API_BASE_URL,
    VITE_WALLETCONNECT_PROJECT_ID: e.VITE_WALLETCONNECT_PROJECT_ID,
    VITE_GA_MEASUREMENT_ID: e.VITE_GA_MEASUREMENT_ID,
    VITE_STARKNET_RPC_URL: e.VITE_STARKNET_RPC_URL,
    VITE_STARKNET_INFURA_API_KEY: e.VITE_STARKNET_INFURA_API_KEY,
    VITE_ETHEREUM_RPC_URL: e.VITE_ETHEREUM_RPC_URL,
    VITE_BASE_RPC_URL: e.VITE_BASE_RPC_URL,
    VITE_SUI_RPC_URL: e.VITE_SUI_RPC_URL,
    VITE_TAC_RPC_URL: e.VITE_TAC_RPC_URL,
    VITE_ZKSYNC_RPC_URL: e.VITE_ZKSYNC_RPC_URL,
    VITE_SOPHON_RPC_URL: e.VITE_SOPHON_RPC_URL,
    VITE_BERACHAIN_RPC_URL: e.VITE_BERACHAIN_RPC_URL,
    VITE_CITREA_RPC_URL: e.VITE_CITREA_RPC_URL,
    VITE_HYPEREVM_RPC_URL: e.VITE_HYPEREVM_RPC_URL,
    VITE_MONAD_RPC_URL: e.VITE_MONAD_RPC_URL,
  }
}

const rawEnv = parseEnv(readImportMetaEnv())

/** Parsed flat env (canonical keys). Prefer `appEnv` in feature code. */
export const env = rawEnv

/** Grouped runtime config — primary API for the rest of the app. */
export const appEnv = createAppEnv(rawEnv)

export const isProd = appEnv.isProd
export const isDev = appEnv.isDev
