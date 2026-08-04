import { EvmBuyProvider, StarknetBuyProvider } from '@/features/buy'
import { useResolvedChain } from '@/hooks/connection'
import { BUY_HERO_SUBTITLE } from '@/mock/buy/constants'
import { ProductHero } from '@/mock/vaults/ProductHero'
import { KeepMountedFamilyStack } from '@/pages/_shared/KeepMountedFamilyStack'
import { EvmBuyTrade } from '@/pages/swap/EvmBuyTrade'
import { StarknetBuyTrade } from '@/pages/swap/StarknetBuyTrade'

/** Home → Buy: live EVM / Starknet multi-step flow. */
export function BuyPage() {
  const { chainFamily } = useResolvedChain()
  // Starknet keeps its tree; every other product network (incl. unsupported ones like
  // TAC / Sui) uses the EVM tree, which falls back to Ethereum form data while
  // BuyFlowView gates the CTA with Switch network → modal.
  const activeId = chainFamily === 'starknet' ? 'starknet' : 'evm'

  return (
    <div className="flex w-full flex-col items-center pt-6 md:pt-10">
      <div className="flex w-full flex-col items-center gap-6 md:gap-12">
        <ProductHero subtitle={BUY_HERO_SUBTITLE} />
        <KeepMountedFamilyStack
          activeId={activeId}
          panels={[
            {
              id: 'evm',
              node: (
                <EvmBuyProvider>
                  <EvmBuyTrade />
                </EvmBuyProvider>
              ),
            },
            {
              id: 'starknet',
              node: (
                <StarknetBuyProvider>
                  <StarknetBuyTrade />
                </StarknetBuyProvider>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
