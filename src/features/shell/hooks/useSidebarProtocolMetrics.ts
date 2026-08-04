import { useMemo } from 'react'

import type { SidebarApyPeriod } from '@/components/shell/types'
import useProtocolStats from '@/features/api/hooks/useProtocolStats'
import useProtocolTvl from '@/features/api/hooks/useProtocolTvl'
import { formatSidebarProtocolMetrics } from '@/features/shell/hooks/sidebar-protocol-metrics'

/**
 * Sidebar protocol metrics:
 * - APY 7D / 28D from `GET /api/v1/protocol-metrics`
 * - TVL from `GET /api/v1/capital` (`tvl`)
 *
 * Not product-vault / Accountable yield TVL.
 */
export function useSidebarProtocolMetrics(apyPeriod: SidebarApyPeriod) {
  const protocolStats = useProtocolStats()
  const protocolTvl = useProtocolTvl()

  return useMemo(
    () =>
      formatSidebarProtocolMetrics({
        apyPeriod,
        sevenDayApy: protocolStats.data?.sevenDayApy,
        twentyEightDayApy: protocolStats.data?.twentyEightDayApy,
        tvl: protocolTvl.data,
        statsLoading: protocolStats.isLoading,
        statsError: protocolStats.isError,
        statsReady: protocolStats.data != null,
        tvlLoading: protocolTvl.isLoading,
        tvlError: protocolTvl.isError,
      }),
    [apyPeriod, protocolStats, protocolTvl],
  )
}

export default useSidebarProtocolMetrics
