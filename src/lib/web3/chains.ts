import { arbitrum, base, mainnet, optimism, polygon, sepolia } from 'wagmi/chains'

import type { ChainKey } from '@/types'

export const CHAIN_META: Record<
  number,
  { key: ChainKey; name: string; shortName: string; color: string }
> = {
  [mainnet.id]: {
    key: 'ethereum',
    name: 'Ethereum',
    shortName: 'ETH',
    color: '#627EEA',
  },
  [arbitrum.id]: {
    key: 'arbitrum',
    name: 'Arbitrum',
    shortName: 'ARB',
    color: '#12AAFF',
  },
  [base.id]: {
    key: 'base',
    name: 'Base',
    shortName: 'BASE',
    color: '#0052FF',
  },
  [optimism.id]: {
    key: 'optimism',
    name: 'Optimism',
    shortName: 'OP',
    color: '#FF0420',
  },
  [polygon.id]: {
    key: 'polygon',
    name: 'Polygon',
    shortName: 'POL',
    color: '#8247E5',
  },
  [sepolia.id]: {
    key: 'sepolia',
    name: 'Sepolia',
    shortName: 'SEP',
    color: '#CFB5F0',
  },
}

export function getChainMeta(chainId: number) {
  return (
    CHAIN_META[chainId] ?? {
      key: 'unknown' as const,
      name: `Chain ${chainId}`,
      shortName: String(chainId),
      color: '#888888',
    }
  )
}
