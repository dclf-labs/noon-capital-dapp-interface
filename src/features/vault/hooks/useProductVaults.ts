import { useMemo } from 'react'

import useYieldAppCitreaVault from '@/features/api/hooks/useYieldAppCitreaVault'
import useYieldAppEthTbtcTvl from '@/features/api/hooks/useYieldAppEthTbtcTvl'
import useYieldAppTvl from '@/features/api/hooks/useYieldAppTvl'
import { PRODUCT_VAULT_DEFINITIONS, type ProductVaultId } from '@/features/vault/catalog'
import { toIntlCompactStr, toIntlStr } from '@/lib/format'
import type { VaultListItem } from '@/mock/vaults'

type VaultMetrics = {
  apy: number | undefined
  tvlUsd: number | undefined
}

function formatApy(apy: number | undefined): string {
  if (apy == null || !Number.isFinite(apy)) return '—'
  return `${toIntlStr(apy, 2, 2)}%`
}

function formatTvl(tvlUsd: number | undefined): string {
  if (tvlUsd == null || !Number.isFinite(tvlUsd)) return '—'
  return toIntlCompactStr(tvlUsd, 2, true, 1, '$')
}

/** Compact TVL for the sidebar (e.g. `6.5M`) — matches Figma chrome, no `$`. */
function formatSidebarTvl(tvlUsd: number | undefined): string {
  if (tvlUsd == null || !Number.isFinite(tvlUsd)) return '—'
  return toIntlCompactStr(tvlUsd, 2, false, 1, '')
}

/**
 * Landing-page product vaults with live APY/TVL from Accountable yield hooks.
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

    const vaults: VaultListItem[] = PRODUCT_VAULT_DEFINITIONS.map((def) => {
      const m = metrics[def.id]
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
      }
    })

    const apys = PRODUCT_VAULT_DEFINITIONS.map((d) => metrics[d.id].apy).filter(
      (v): v is number => typeof v === 'number' && Number.isFinite(v),
    )
    const tvls = PRODUCT_VAULT_DEFINITIONS.map((d) => metrics[d.id].tvlUsd).filter(
      (v): v is number => typeof v === 'number' && Number.isFinite(v),
    )

    const maxApy = apys.length ? Math.max(...apys) : undefined
    const totalTvl = tvls.length ? tvls.reduce((sum, v) => sum + v, 0) : undefined

    return {
      vaults,
      sidebarApy: formatApy(maxApy),
      sidebarTvl: formatSidebarTvl(totalTvl),
      isLoading: monad.isLoading || ethereumTbtc.isLoading || citreaWcbtc.isLoading,
      isError: monad.isError || ethereumTbtc.isError || citreaWcbtc.isError,
    }
  }, [monad, ethereumTbtc, citreaWcbtc])
}

export default useProductVaults
