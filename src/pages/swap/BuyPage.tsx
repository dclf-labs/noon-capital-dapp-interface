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
  const activeId = chainFamily === 'evm' ? 'evm' : chainFamily === 'starknet' ? 'starknet' : 'none'

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
        {activeId === 'none' ? (
          <p className="w-full max-w-[70%] min-w-[45%] text-center text-sm text-stone-500">
            Buy is available on EVM and Starknet. Switch the active network above.
          </p>
        ) : null}
      </div>
    </div>
  )
}
