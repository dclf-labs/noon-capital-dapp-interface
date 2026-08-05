import { useMemo } from 'react'

import { formatPercent } from '@/features/_shared/trade-display'
import useYieldAppCitreaVault from '@/features/api/hooks/useYieldAppCitreaVault'
import useYieldAppEthTbtcTvl from '@/features/api/hooks/useYieldAppEthTbtcTvl'
import useYieldAppTvl from '@/features/api/hooks/useYieldAppTvl'
import { PRODUCT_VAULT_DEFINITIONS, type ProductVaultId } from '@/features/vault/catalog'
import { toIntlCompactStr } from '@/lib/format'
import type { VaultListItem } from '@/mock/vaults'

type VaultMetrics = {
  apy: number | undefined
  tvlUsd: number | undefined
}

function formatApy(apy: number | undefined): string {
  if (apy == null || !Number.isFinite(apy)) return '—'
  return formatPercent(apy)
}

function formatTvl(tvlUsd: number | undefined): string {
  if (tvlUsd == null || !Number.isFinite(tvlUsd)) return '—'
  return toIntlCompactStr(tvlUsd, 1, true, 0, '$', '', 1)
}

/**
 * Landing-page product vaults with live APY/TVL from Accountable yield hooks.
 * Sidebar protocol APY/TVL lives in `useSidebarProtocolMetrics`.
 */
export function useProductVaults() {
  const monad = useYieldAppTvl()
  const ethereumTbtc = useYieldAppEthTbtcTvl()
  const citreaWcbtc = useYieldAppCitreaVault()

  return useMemo(() => {
    const metrics: Record<ProductVaultId, VaultMetrics> = {
      'usdc-mon': {
        apy: monad.data?.apy,
        tvlUsd: monad.data?.tvlUsd,
      },
      'tbtc-eth': {
        apy: ethereumTbtc.data?.apy,
        tvlUsd: ethereumTbtc.data?.tvlUsd,
      },
      'wcbtc-citrea': {
        apy: citreaWcbtc.data?.apy,
        tvlUsd: citreaWcbtc.data?.tvlUsd,
      },
    }

    const sources: Record<ProductVaultId, { isLoading: boolean; isFetching: boolean }> = {
      'usdc-mon': { isLoading: monad.isLoading, isFetching: monad.isFetching },
      'tbtc-eth': { isLoading: ethereumTbtc.isLoading, isFetching: ethereumTbtc.isFetching },
      'wcbtc-citrea': { isLoading: citreaWcbtc.isLoading, isFetching: citreaWcbtc.isFetching },
    }

    const vaults: VaultListItem[] = PRODUCT_VAULT_DEFINITIONS.map((def) => {
      const m = metrics[def.id]
      const source = sources[def.id]
      const metricsBusy = source.isLoading || source.isFetching
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        chainName: def.chainName,
        chainIconSrc: def.chainIconSrc,
        assetSymbol: def.assetSymbol,
        assetIconSrc: def.assetIconSrc,
        iconSrc: def.iconSrc,
        href: def.href,
        apyLabel: formatApy(m.apy),
        tvlLabel: formatTvl(m.tvlUsd),
        isApyLoading: metricsBusy,
        isTvlLoading: metricsBusy,
      }
    })

    return {
      vaults,
      isLoading: monad.isLoading || ethereumTbtc.isLoading || citreaWcbtc.isLoading,
      isError: monad.isError || ethereumTbtc.isError || citreaWcbtc.isError,
    }
  }, [monad, ethereumTbtc, citreaWcbtc])
}

export default useProductVaults
