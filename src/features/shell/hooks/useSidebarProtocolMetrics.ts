import { useMemo } from 'react'

import type { SidebarApyPeriod } from '@/components/shell/types'
import useProtocolStats from '@/features/api/hooks/useProtocolStats'
import useProtocolTvl from '@/features/api/hooks/useProtocolTvl'
import { toIntlCompactStr, toNum } from '@/lib/format'

/**
 * Sidebar protocol metrics — same sources as the legacy dapp chrome:
 * - APY 7D / 28D from `GET /api/v1/protocol-metrics`
 * - TVL from `GET /api/v1/capital` (`tvl`)
 *
 * Not product-vault / Accountable yield TVL.
 */
export function useSidebarProtocolMetrics(apyPeriod: SidebarApyPeriod) {
  const protocolStats = useProtocolStats()
  const protocolTvl = useProtocolTvl()

  return useMemo(() => {
    const apyRaw =
      apyPeriod === '28d' ? protocolStats.data?.twentyEightDayApy : protocolStats.data?.sevenDayApy
    const apyReady =
      !protocolStats.isLoading && protocolStats.data != null && Number.isFinite(toNum(apyRaw))

    const tvlReady = !protocolTvl.isLoading
    const tvlRaw = protocolTvl.data

    return {
      apy: apyReady ? toIntlCompactStr(apyRaw, 2, true, 1, '', '%') : '—',
      tvl: tvlReady ? toIntlCompactStr(tvlRaw, 2, true, 1, '', '') : '—',
      isLoading: protocolStats.isLoading || protocolTvl.isLoading,
      isError: protocolStats.isError || protocolTvl.isError,
    }
  }, [apyPeriod, protocolStats, protocolTvl])
}

export default useSidebarProtocolMetrics
