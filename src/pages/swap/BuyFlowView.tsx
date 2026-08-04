import { useState } from 'react'

import type { ChainFamily } from '@/chains'
import { TransitionPanel } from '@/components/ui/transition-panel'
import { useElementSize } from '@/hooks/ui/useElementSize'
import { buyTokenAmountFromUsd, payAmountFromBuyAmount } from '@/mock/buy/buy-amount'
import { BuyConfirmPanel } from '@/mock/buy/BuyConfirmPanel'
import { BuyPanel } from '@/mock/buy/BuyPanel'
import { BuyStepShell } from '@/mock/buy/BuyStepShell'
import { BuySuccessPanel } from '@/mock/buy/BuySuccessPanel'
import type { BuyPoweredBy } from '@/mock/buy/powered-by'
import type { TradePanelViewProps } from '@/mock/swap/TradePanelView'
import { useConnectWalletFamily } from '@/wallet/useConnectWalletFamily'

export type BuyFlowViewProps = TradePanelViewProps & {
  /** Wallet family used when the card CTA is “Connect wallet”. */
  chainFamily: ChainFamily
  /** USD price of tokenOut for $ presets. */
  buyTokenUsdPrice?: number
  /** tokenOut received per 1 tokenIn. */
  unitOutPerIn?: number
  /** DEX brand for the step-0 "Powered by" row. */
  poweredBy?: BuyPoweredBy
  /** Native gas-token fee for the step-0 / confirm hover card. */
  feeNativeLabel?: string
  /** Submit gas estimate still loading (confirm step fee row). */
  isLoadingFee?: boolean
  /** When false, page chrome (hero) is owned by the parent (avoids remount flicker). */
  showHero?: boolean
  /** Set pay + buy amounts from a desired buy-token quantity. */
  onBuyAmountChange?: (buyAmount: number | undefined) => void
}

/** Shared step-panel spring — no height tween. */
const PANEL_TRANSITION = {
  x: { type: 'spring' as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
}

/**
 * Buy multi-step surface:
 * - step 0 → Figma Buy card (amounts / tokens / approve+next)
 * - step 1 → Figma confirm (on-chain submit)
 * - step ≥ 2 → Figma success (tx minted)
 *
 * Step motion (`popLayout` + spring x):
 * enter bridges the previous panel height, center settles to `auto`.
 */
export function BuyFlowView({
  chainFamily,
  buyTokenUsdPrice,
  unitOutPerIn,
  poweredBy,
  feeNativeLabel,
  isLoadingFee,
  showHero = true,
  onBuyAmountChange,
  ...props
}: BuyFlowViewProps) {
  const connectWalletFamily = useConnectWalletFamily()
  const {
    step,
    isConnected,
    unsupported,
    tokenIn,
    tokenOut,
    tokensIn,
    tokensOut,
    amountIn,
    amountOut,
    balanceInLabel,
    feeLabel,
    isFetchingQuote,
    primaryLabel,
    primaryDisabled,
    primaryLoading,
    presetsDisabled,
    txnUrl,
    onAmountInChange,
    onTokenInChange,
    onTokenOutChange,
    onPrimary,
    onBack,
    onReset,
  } = props

  const feeLoading = Boolean(isLoadingFee)
  const activeIndex = Math.min(Math.max(step, 0), 2)

  const [measureRef, bounds] = useElementSize()

  // Snapshot outgoing height + direction on the same render as the step change,
  // before the measure ref attaches to the incoming panel (avoids height flash).
  const [panelNav, setPanelNav] = useState({
    index: activeIndex,
    direction: 1,
    enterHeight: 'auto' as number | 'auto',
  })
  if (activeIndex !== panelNav.index) {
    setPanelNav({
      index: activeIndex,
      direction: activeIndex > panelNav.index ? 1 : -1,
      enterHeight: bounds.height > 0 ? bounds.height : 'auto',
    })
  }

  const showConnect = !isConnected

  const applyBuyAmount = (buyAmount: number | undefined) => {
    if (onBuyAmountChange) {
      onBuyAmountChange(buyAmount)
      return
    }
    const pay = buyAmount != null ? payAmountFromBuyAmount(buyAmount, unitOutPerIn) : undefined
    onAmountInChange(pay)
  }

  return (
    <BuyStepShell poweredBy={poweredBy} showHero={showHero}>
      <TransitionPanel
        className="w-full"
        panelClassName="w-full"
        activeIndex={activeIndex}
        custom={panelNav.direction}
        variants={{
          enter: (dir: number) => ({
            x: dir > 0 ? 364 : -364,
            opacity: 0,
            height: panelNav.enterHeight,
            position: 'initial' as const,
          }),
          center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            height: 'auto',
          },
          exit: (dir: number) => ({
            zIndex: 0,
            x: dir < 0 ? 364 : -364,
            opacity: 0,
            position: 'absolute' as const,
            top: 0,
            width: '100%',
          }),
        }}
        transition={PANEL_TRANSITION}
      >
        <div ref={measureRef} className="w-full">
          <BuyPanel
            amountIn={amountIn}
            amountOut={amountOut}
            buyTokenUsdPrice={buyTokenUsdPrice}
            unitOutPerIn={unitOutPerIn}
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            tokensIn={tokensIn}
            tokensOut={tokensOut}
            balanceInLabel={balanceInLabel}
            networkFeeLabel={feeLabel ?? '—'}
            networkFeeNativeLabel={feeNativeLabel}
            primaryLabel={showConnect ? 'Connect wallet' : primaryLabel}
            primaryDisabled={showConnect ? false : primaryDisabled}
            primaryLoading={showConnect ? false : primaryLoading}
            isConnected={isConnected}
            presetsDisabled={presetsDisabled || unsupported}
            isFetchingQuote={isFetchingQuote}
            isLoadingFee={feeLoading}
            onBuyAmountChange={applyBuyAmount}
            onUsdPreset={(usd) => {
              const buyAmount = buyTokenAmountFromUsd(usd, buyTokenUsdPrice)
              applyBuyAmount(buyAmount)
            }}
            onTokenInChange={onTokenInChange}
            onTokenOutChange={onTokenOutChange}
            onPrimary={() => {
              if (showConnect) {
                void connectWalletFamily(chainFamily)
                return
              }
              onPrimary()
            }}
          />
        </div>

        <div ref={measureRef} className="flex w-full flex-col gap-3">
          <BuyConfirmPanel
            amountIn={amountIn}
            amountOut={amountOut}
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            networkFeeLabel={feeLabel ?? '—'}
            networkFeeNativeLabel={feeNativeLabel}
            primaryLabel={primaryLabel}
            primaryDisabled={primaryDisabled || unsupported}
            primaryLoading={primaryLoading}
            isLoadingFee={feeLoading}
            onPrimary={onPrimary}
            onBack={onBack}
          />
        </div>

        <div ref={measureRef} className="w-full">
          <BuySuccessPanel
            amountOut={amountOut}
            tokenOut={tokenOut}
            txnUrl={txnUrl}
            onBuyMore={onReset}
          />
        </div>
      </TransitionPanel>
    </BuyStepShell>
  )
}
