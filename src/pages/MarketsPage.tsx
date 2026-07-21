import { useEffect } from 'react'

import { arbitrum, base, mainnet } from 'wagmi/chains'

import { FadeIn } from '@/components/motion/fade-in'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatNumber } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setMarkets, setMarketsLoading } from '@/store/slices/marketsSlice'
import type { MarketSummary } from '@/types'

const DEMO_MARKETS: MarketSummary[] = [
  {
    id: 'usdc-eth',
    name: 'USDC Vault',
    chainId: mainnet.id,
    tvl: 42_500_000,
    apy: 4.82,
    asset: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: mainnet.id,
    },
  },
  {
    id: 'eth-arb',
    name: 'ETH Yield',
    chainId: arbitrum.id,
    tvl: 18_200_000,
    apy: 3.41,
    asset: {
      address: '0x0000000000000000000000000000000000000000',
      symbol: 'ETH',
      name: 'Ether',
      decimals: 18,
      chainId: arbitrum.id,
    },
  },
  {
    id: 'usdc-base',
    name: 'Base Liquidity',
    chainId: base.id,
    tvl: 9_750_000,
    apy: 5.12,
    asset: {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      chainId: base.id,
    },
  },
]

export function MarketsPage() {
  useDocumentTitle('Markets')
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector((s) => s.markets)

  useEffect(() => {
    let cancelled = false
    dispatch(setMarketsLoading(true))

    const id = window.setTimeout(() => {
      if (cancelled) return
      dispatch(setMarkets(DEMO_MARKETS))
    }, 350)

    return () => {
      cancelled = true
      window.clearTimeout(id)
      dispatch(setMarketsLoading(false))
    }
  }, [dispatch])

  return (
    <FadeIn className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Markets</h1>
        <p className="mt-1 text-muted-foreground">
          Demo market list wired to Redux — replace with protocol subgraph or indexer calls.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading markets…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((market) => (
            <Card key={market.id}>
              <CardHeader>
                <CardTitle>{market.name}</CardTitle>
                <CardDescription>
                  {market.asset.symbol} · Chain {market.chainId}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">TVL</p>
                  <p className="font-medium">
                    ${formatNumber(market.tvl, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">APY</p>
                  <p className="font-medium">{formatNumber(market.apy)}%</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </FadeIn>
  )
}
