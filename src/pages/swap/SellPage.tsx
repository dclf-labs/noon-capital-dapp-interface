import { EvmSellProvider, StarknetSellProvider } from '@/features/sell'
import { useResolvedChain } from '@/hooks/connection'
import { PRODUCT_HERO_SUBTITLES } from '@/mock/_shared/product-tabs'
import { ProductHero } from '@/mock/vaults/ProductHero'
import { KeepMountedFamilyStack } from '@/pages/_shared/KeepMountedFamilyStack'
import { EvmSellTrade } from '@/pages/swap/EvmSellTrade'
import { StarknetSellTrade } from '@/pages/swap/StarknetSellTrade'

/** Sell: live EVM / Starknet multi-step flow — same chrome as Buy. */
export function SellPage() {
  const { chainFamily } = useResolvedChain()
  const activeId = chainFamily === 'starknet' ? 'starknet' : 'evm'

  return (
    <div className="flex w-full flex-col items-center pt-6 md:pt-10">
      <div className="flex w-full flex-col items-center gap-6 md:gap-12">
        <ProductHero subtitle={PRODUCT_HERO_SUBTITLES.sell} />
        <KeepMountedFamilyStack
          activeId={activeId}
          panels={[
            {
              id: 'evm',
              node: (
                <EvmSellProvider>
                  <EvmSellTrade />
                </EvmSellProvider>
              ),
            },
            {
              id: 'starknet',
              node: (
                <StarknetSellProvider>
                  <StarknetSellTrade />
                </StarknetSellProvider>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
