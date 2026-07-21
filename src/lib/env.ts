import { z } from 'zod'

export const envSchema = z.object({
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  DEV: z.boolean(),
  PROD: z.boolean(),
  SSR: z.boolean(),
  BASE_URL: z.string(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_WALLETCONNECT_PROJECT_ID: z.string().optional().default(''),
  VITE_ALCHEMY_API_KEY: z.string().optional().default(''),
})

export type AppEnv = z.infer<typeof envSchema>

export function parseEnv(input: unknown): AppEnv {
  const parsed = envSchema.safeParse(input)

  if (!parsed.success) {
    console.error('Invalid environment variables', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment configuration. Check .env against .env.example.')
  }

  return parsed.data
}

export const env = parseEnv({
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  SSR: import.meta.env.SSR,
  BASE_URL: import.meta.env.BASE_URL,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  VITE_WALLETCONNECT_PROJECT_ID: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? '',
  VITE_ALCHEMY_API_KEY: import.meta.env.VITE_ALCHEMY_API_KEY ?? '',
})

export const isProd = env.PROD
export const isDev = env.DEV
