import { describe, expect, it } from 'vitest'

import { createAppStore } from '@/store'
import { setMarkets, setMarketsError, setMarketsLoading } from '@/store/slices/marketsSlice'
import { clearPortfolio, setPortfolio, setPortfolioLoading } from '@/store/slices/portfolioSlice'
import {
  setConnectModalOpen,
  setSidebarOpen,
  setTheme,
  toggleSidebar,
} from '@/store/slices/uiSlice'

describe('uiSlice', () => {
  it('updates theme, sidebar, and connect modal state', () => {
    const store = createAppStore()

    store.dispatch(setTheme('dark'))
    store.dispatch(setSidebarOpen(true))
    store.dispatch(toggleSidebar())
    store.dispatch(setConnectModalOpen(true))

    const ui = store.getState().ui
    expect(ui.theme).toBe('dark')
    expect(ui.sidebarOpen).toBe(false)
    expect(ui.connectModalOpen).toBe(true)
  })
})

describe('marketsSlice', () => {
  it('tracks loading, data, and errors', () => {
    const store = createAppStore()

    store.dispatch(setMarketsLoading(true))
    expect(store.getState().markets.isLoading).toBe(true)

    store.dispatch(
      setMarkets([
        {
          id: 'm1',
          name: 'Test',
          chainId: 1,
          tvl: 100,
          apy: 1,
          asset: {
            address: '0x0000000000000000000000000000000000000001',
            symbol: 'T',
            name: 'Test',
            decimals: 18,
            chainId: 1,
          },
        },
      ]),
    )

    expect(store.getState().markets.items).toHaveLength(1)
    expect(store.getState().markets.isLoading).toBe(false)

    store.dispatch(setMarketsError('failed'))
    expect(store.getState().markets.error).toBe('failed')
  })
})

describe('portfolioSlice', () => {
  it('sets and clears portfolio state', () => {
    const store = createAppStore()

    store.dispatch(setPortfolioLoading(true))
    store.dispatch(
      setPortfolio({
        totalValueUsd: 42,
        positions: [{ marketId: 'm1', amount: '1', valueUsd: 42, chainId: 1 }],
      }),
    )

    expect(store.getState().portfolio.totalValueUsd).toBe(42)
    expect(store.getState().portfolio.positions).toHaveLength(1)

    store.dispatch(clearPortfolio())
    expect(store.getState().portfolio.totalValueUsd).toBe(0)
    expect(store.getState().portfolio.positions).toHaveLength(0)
  })
})
