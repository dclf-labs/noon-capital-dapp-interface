import useProductVaults from '@/features/vault/hooks/useProductVaults'
import { VaultsPageView } from '@/mock/vaults'

/** Product vaults list — chrome (sidebar / wallet / footer) comes from AppShell. */
export function VaultsPage() {
  const { vaults } = useProductVaults()

  return <VaultsPageView vaults={vaults} />
}
