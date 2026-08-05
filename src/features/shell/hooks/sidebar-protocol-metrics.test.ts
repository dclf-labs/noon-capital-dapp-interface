import { describe, expect, it } from 'vitest'

import { formatSidebarProtocolMetrics } from '@/features/shell/hooks/sidebar-protocol-metrics'

describe('formatSidebarProtocolMetrics', () => {
  it('formats 7d / 28d APY and TVL when data is ready', () => {
    const seven = formatSidebarProtocolMetrics({
      apyPeriod: '7d',
      sevenDayApy: 6.94,
      twentyEightDayApy: 8.26,
      tvl: 35_122_827.79,
      statsLoading: false,
      statsError: false,
      statsReady: true,
      tvlLoading: false,
      tvlError: false,
    })
    expect(seven.apy).toMatch(/%$/)
    expect(seven.apy).toContain('6.94')
    expect(seven.tvl).toMatch(/M|35/)
    expect(seven.isLoading).toBe(false)
    expect(seven.isError).toBe(false)

    const twentyEight = formatSidebarProtocolMetrics({
      apyPeriod: '28d',
      sevenDayApy: 6.94,
      twentyEightDayApy: 8.26,
      tvl: 35_122_827.79,
      statsLoading: false,
      statsError: false,
      statsReady: true,
      tvlLoading: false,
      tvlError: false,
    })
    expect(twentyEight.apy).toContain('8.26')
  })

  it('shows placeholders while loading or on error', () => {
    expect(
      formatSidebarProtocolMetrics({
        apyPeriod: '7d',
        sevenDayApy: 6.94,
        twentyEightDayApy: 8.26,
        tvl: 1,
        statsLoading: true,
        statsError: false,
        statsReady: false,
        tvlLoading: true,
        tvlError: false,
      }),
    ).toMatchObject({
      apy: '—',
      tvl: '—',
      isLoading: true,
      isApyLoading: true,
      isTvlLoading: true,
    })

    expect(
      formatSidebarProtocolMetrics({
        apyPeriod: '7d',
        sevenDayApy: 6.94,
        twentyEightDayApy: 8.26,
        tvl: 0,
        statsLoading: false,
        statsError: true,
        statsReady: false,
        tvlLoading: false,
        tvlError: true,
      }),
    ).toMatchObject({ apy: '—', tvl: '—', isError: true })
  })
})
