import type { SidebarApyPeriod } from '@/components/shell/types'
import { toIntlCompactStr, toNum } from '@/lib/format'

export type SidebarProtocolMetricsInput = {
  apyPeriod: SidebarApyPeriod
  sevenDayApy: number | string | undefined
  twentyEightDayApy: number | string | undefined
  tvl: number | string | undefined
  statsLoading: boolean
  statsError: boolean
  statsReady: boolean
  tvlLoading: boolean
  tvlError: boolean
}

export type SidebarProtocolMetricsView = {
  apy: string
  tvl: string
  isLoading: boolean
  isError: boolean
}

/** Pure formatter for sidebar APY / TVL labels (testable without React Query). */
export function formatSidebarProtocolMetrics(
  input: SidebarProtocolMetricsInput,
): SidebarProtocolMetricsView {
  const apyRaw = input.apyPeriod === '28d' ? input.twentyEightDayApy : input.sevenDayApy
  const apyReady =
    !input.statsLoading && !input.statsError && input.statsReady && Number.isFinite(toNum(apyRaw))

  const tvlReady = !input.tvlLoading && !input.tvlError && input.tvl != null

  return {
    apy: apyReady ? toIntlCompactStr(apyRaw, 2, true, 0, '', '%', 2) : '—',
    tvl: tvlReady ? toIntlCompactStr(input.tvl, 1, true, 0, '', '', 1) : '—',
    isLoading: input.statsLoading || input.tvlLoading,
    isError: input.statsError || input.tvlError,
  }
}
