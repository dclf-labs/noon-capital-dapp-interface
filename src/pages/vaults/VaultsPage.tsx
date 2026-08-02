import useProductVaults from '@/features/vault/hooks/useProductVaults'
import { type VaultListItem, VaultsPageView } from '@/mock/vaults'

/** Product vaults list — chrome (sidebar / wallet / footer) comes from AppShell. */
export function VaultsPage() {
  const { vaults } = useProductVaults()

  const handleEarnClick = (vault: VaultListItem) => {
    if (vault.href) {
      window.open(vault.href, '_blank', 'noopener,noreferrer')
    }
  }

  return <VaultsPageView vaults={vaults} onEarnClick={handleEarnClick} />
}
