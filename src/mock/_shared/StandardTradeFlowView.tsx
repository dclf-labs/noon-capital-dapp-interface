import { type ReactNode, useState } from 'react'

import { TransitionPanel } from '@/components/ui/transition-panel'
import type { Token } from '@/config/token'
import { useElementSize } from '@/hooks/ui/useElementSize'
import { ProductStepShell } from '@/mock/_shared/ProductStepShell'
import { StandardTradeConfirmPanel } from '@/mock/_shared/StandardTradeConfirmPanel'
import { StandardTradePanel, type StandardTradePanelProps } from '@/mock/_shared/StandardTradePanel'
import { StandardTradeSuccessPanel } from '@/mock/_shared/StandardTradeSuccessPanel'
import { UnitRateRow } from '@/mock/_shared/UnitRateRow'
import { NetworkFeeHover } from '@/mock/buy/NetworkFeeHover'

const PANEL_TRANSITION = {
  x: { type: 'spring' as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
}

export type StandardTradeFlowViewProps = StandardTradePanelProps & {
  step: number
  confirmTitle: string
  successHeadline: string
  moreLabel: string
  successNote?: string
  /** When false, page owns ProductHero (avoids remount flicker). */
  showHero?: boolean
  heroSubtitle?: string
  txnUrl?: string
  confirmFeeRow?: ReactNode
  /** Shown on confirm (step 1); form step uses `notice` from panel props. */
  confirmNotice?: ReactNode
  payColumnLabel?: string
  receiveColumnLabel?: string
  tokenIn?: Token
  tokenOut?: Token
  onBack?: () => void
  onReset?: () => void
}

/**
 * Shared 3-step trade surface (form → confirm → success) with the same spring
 * TransitionPanel motion as Buy / Bridge. Presentational only.
 */
export function StandardTradeFlowView({
  step,
  confirmTitle,
  successHeadline,
  moreLabel,
  successNote,
  showHero = false,
  heroSubtitle = '',
  txnUrl,
  confirmFeeRow,
  confirmNotice,
  payColumnLabel,
  receiveColumnLabel,
  onBack,
  onReset,
  ...panelProps
}: StandardTradeFlowViewProps) {
  const feeRow = confirmFeeRow ?? (
    <>
      <UnitRateRow
        tokenIn={panelProps.tokenIn}
        tokenOut={panelProps.tokenOut}
        rateLabel={panelProps.unitRateLabel}
      />
      <NetworkFeeHover
        usdLabel={panelProps.feeLabel || '—'}
        nativeLabel={panelProps.feeNativeLabel}
        isLoading={panelProps.isLoadingFee}
      />
    </>
  )

  const activeIndex = Math.min(Math.max(step, 0), 2)
  const [measureRef, bounds] = useElementSize()
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

  const body = (
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
        <StandardTradePanel {...panelProps} />
      </div>
      <div ref={measureRef} className="w-full">
        <StandardTradeConfirmPanel
          title={confirmTitle}
          payColumnLabel={payColumnLabel}
          receiveColumnLabel={receiveColumnLabel}
          amountIn={panelProps.amountIn}
          amountOut={panelProps.amountOut}
          tokenIn={panelProps.tokenIn}
          tokenOut={panelProps.tokenOut}
          notice={confirmNotice}
          feeRow={feeRow}
          primaryLabel={panelProps.primaryLabel}
          primaryDisabled={panelProps.primaryDisabled}
          primaryLoading={panelProps.primaryLoading}
          onPrimary={panelProps.onPrimary}
          onBack={onBack}
        />
      </div>
      <div ref={measureRef} className="w-full">
        <StandardTradeSuccessPanel
          headline={successHeadline}
          amountOut={panelProps.amountOut}
          tokenOut={panelProps.tokenOut}
          note={successNote}
          txnUrl={txnUrl}
          moreLabel={moreLabel}
          onMore={() => onReset?.()}
        />
      </div>
    </TransitionPanel>
  )

  if (!showHero) return body

  return (
    <ProductStepShell subtitle={heroSubtitle} showHero>
      {body}
    </ProductStepShell>
  )
}
