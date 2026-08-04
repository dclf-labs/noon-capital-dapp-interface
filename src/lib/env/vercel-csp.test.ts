import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Production CSP is applied by Vercel (`vercel.json`), not Vite.
 * Keep `connect-src` aligned with Starknet Infura, Noon API, and default RPCs.
 */
describe('vercel.json Content-Security-Policy connect-src', () => {
  const vercel = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
    headers?: Array<{ headers?: Array<{ key: string; value: string }> }>
  }

  const csp =
    vercel.headers
      ?.flatMap((entry) => entry.headers ?? [])
      .find((header) => header.key === 'Content-Security-Policy')?.value ?? ''

  const connectSrc = csp
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('connect-src '))

  it('defines a connect-src directive', () => {
    expect(connectSrc).toBeTruthy()
  })

  it.each([
    ['Starknet Infura', 'https://starknet-mainnet.infura.io'],
    ['Starknet Blast public', 'https://starknet-mainnet.public.blastapi.io'],
    ['Starknet Lava public', 'https://rpc.starknet.lava.build'],
    ['Noon API', 'https://back.noon.capital'],
    ['Ethereum publicnode (default RPC)', 'https://ethereum.publicnode.com'],
    ['TAC default RPC', 'https://rpc.tac.build'],
    ['Monad default RPC', 'https://rpc.monad.xyz'],
    ['Accountable yield API', 'https://yield.accountable.capital'],
    ['Vesu API', 'https://api.vesu.xyz'],
    ['Vesu staging API', 'https://staging.vaults-api.vesu.xyz'],
    ['Sui fullnode', 'https://fullnode.mainnet.sui.io'],
    ['Alchemy wildcard (EVM/Sui overrides)', 'https://*.g.alchemy.com'],
  ] as const)('allowlists %s', (_label, host) => {
    expect(connectSrc).toContain(host)
  })
})
