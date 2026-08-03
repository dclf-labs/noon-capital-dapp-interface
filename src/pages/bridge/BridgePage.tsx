import { EvmBridgeProvider, StarknetBridgeProvider, SuiBridgeProvider } from '@/features/bridge'
import { useResolvedChain } from '@/hooks/connection'
import { BRIDGE_HERO_SUBTITLE } from '@/mock/bridge/constants'
import { ProductHero } from '@/mock/vaults/ProductHero'
import { KeepMountedFamilyStack } from '@/pages/_shared/KeepMountedFamilyStack'
import { EvmBridgeFlow } from '@/pages/bridge/EvmBridgeFlow'
import { StarknetBridgeFlow } from '@/pages/bridge/StarknetBridgeFlow'
import { SuiBridgeFlow } from '@/pages/bridge/SuiBridgeFlow'

/** Home → Bridge: live EVM / Starknet / Sui multi-step flow. */
export function BridgePage() {
  const { chainFamily } = useResolvedChain()
  const activeId =
    chainFamily === 'evm'
      ? 'evm'
      : chainFamily === 'starknet'
        ? 'starknet'
        : chainFamily === 'sui'
          ? 'sui'
          : 'none'

  return (
    <div className="flex w-full flex-col items-center pt-6 md:pt-10">
      <div className="flex w-full flex-col items-center gap-6 md:gap-12">
        <ProductHero subtitle={BRIDGE_HERO_SUBTITLE} />
        <KeepMountedFamilyStack
          activeId={activeId}
          panels={[
            {
              id: 'evm',
              node: (
                <EvmBridgeProvider>
                  <EvmBridgeFlow />
                </EvmBridgeProvider>
              ),
            },
            {
              id: 'starknet',
              node: (
                <StarknetBridgeProvider>
                  <StarknetBridgeFlow />
                </StarknetBridgeProvider>
              ),
            },
            {
              id: 'sui',
              node: (
                <SuiBridgeProvider>
                  <SuiBridgeFlow />
                </SuiBridgeProvider>
              ),
            },
          ]}
        />
        {activeId === 'none' ? (
          <p className="w-full max-w-[70%] min-w-[45%] text-center text-sm text-stone-500">
            Bridge is available on EVM, Starknet, and Sui. Switch the active network above.
          </p>
        ) : null}
      </div>
    </div>
  )
}
