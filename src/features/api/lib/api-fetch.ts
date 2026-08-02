/**
 * Typed fetch helper for the Noon app API.
 *
 * Always goes through `appEnv.api.baseUrl` — never hardcode hosts in hooks.
 * Prefer this helper for API calls instead of inlining `fetch(\`${appEnv.api.baseUrl}…\`)`.
 */
import { appEnv } from '@/lib/env'

export class ApiError extends Error {
  readonly status: number
  readonly path: string

  constructor(status: number, path: string, message?: string) {
    super(message ?? `API ${status}: ${path}`)
    this.name = 'ApiError'
    this.status = status
    this.path = path
  }
}

function apiBaseUrl(): string {
  const base = appEnv.api.baseUrl
  if (!base) {
    throw new Error('VITE_API_BASE_URL is not configured')
  }
  return base
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`${apiBaseUrl()}${normalizedPath}`, init)

  if (!response.ok) {
    throw new ApiError(response.status, normalizedPath)
  }

  return (await response.json()) as T
}

/** Safe lowercase wallet segment for path params (empty string if missing). */
export function apiAddressPath(address: string | undefined): string {
  return (address ?? '').toLowerCase()
}
