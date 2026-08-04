import { useState } from 'react'

import type { ChainFamily } from '@/chains'
import { chainIconSrc } from '@/components/shell/network'
import { TransitionPanel } from '@/components/ui/transition-panel'
import { useElementSize } from '@/hooks/ui/useElementSize'
import { getChainConfig } from '@/lib/chain'
import { BridgeConfirmPanel } from '@/mock/bridge/BridgeConfirmPanel'
import { BridgePanel } from '@/mock/bridge/BridgePanel'
import { BridgeStepShell } from '@/mock/bridge/BridgeStepShell'
import { BridgeSuccessPanel } from '@/mock/bridge/BridgeSuccessPanel'
import type { BridgePanelProps } from '@/mock/bridge/types'
import { useConnectWalletFamily } from '@/wallet/useConnectWalletFamily'

export type BridgeFlowViewProps = BridgePanelProps & {
  step: number
  /** Wallet family used when the card CTA is “Connect wallet”. */
  chainFamily: ChainFamily
  /** When false, page chrome (hero) is owned by the parent (avoids remount flicker). */
  showHero?: boolean
  sourceName?: string
  destinationName?: string
  txnUrl?: string
  onBack?: () => void
  onReset?: () => void
}

/** Same spring as BuyFlowView step panel — no height tween. */
const PANEL_TRANSITION = {
  x: { type: 'spring' as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
}

/**
 * Bridge multi-step surface:
 * - step 0 → Figma bridge card (networks / amount / receiver)
 * - step 1 → confirm (on-chain submit)
 * - step ≥ 2 → success
 *
 * Step motion matches BuyFlowView: enter bridges the previous panel height,
 * center settles to `auto` (avoids layout flash between steps).
 */
export function BridgeFlowView({
  step,
  chainFamily,
  showHero = true,
  sourceName,
  destinationName,
  txnUrl,
  onBack,
  onReset,
  ...panelProps
}: BridgeFlowViewProps) {
  const connectWalletFamily = useConnectWalletFamily()
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

  const showConnect = !panelProps.isConnected
  const feeLoading = Boolean(panelProps.isLoadingFee || panelProps.isFetchingFee)
  const sourceAddressExplorerUrl = panelProps.sourceChainId
    ? getChainConfig(panelProps.sourceChainId).addressExplorerUrl
    : undefined
  const destinationAddressExplorerUrl = panelProps.destinationChainId
    ? getChainConfig(panelProps.destinationChainId).addressExplorerUrl
    : undefined

  return (
    <BridgeStepShell showHero={showHero}>
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
          <BridgePanel
            {...panelProps}
            primaryLabel={showConnect ? 'Connect wallet' : panelProps.primaryLabel}
            primaryDisabled={showConnect ? false : panelProps.primaryDisabled}
            primaryLoading={showConnect ? false : panelProps.primaryLoading}
            presetsDisabled={Boolean(panelProps.presetsDisabled || panelProps.unsupported)}
            onPrimary={() => {
              if (showConnect) {
                void connectWalletFamily(chainFamily)
                return
              }
              panelProps.onPrimary()
            }}
          />
        </div>

        <div ref={measureRef} className="flex w-full flex-col gap-3">
          <BridgeConfirmPanel
            amount={panelProps.amount}
            token={panelProps.token}
            sourceName={sourceName}
            destinationName={destinationName}
            sourceChainIconSrc={
              panelProps.sourceChainId ? chainIconSrc(panelProps.sourceChainId) : undefined
            }
            destinationChainIconSrc={
              panelProps.destinationChainId
                ? chainIconSrc(panelProps.destinationChainId)
                : undefined
            }
            sourceAddress={panelProps.connectedAddress}
            receiverValue={panelProps.receiverValue}
            sourceAddressExplorerUrl={sourceAddressExplorerUrl}
            destinationAddressExplorerUrl={destinationAddressExplorerUrl}
            bridgeFeeLabel={panelProps.feeLabel}
            etaLabel={panelProps.etaLabel}
            networkFeeLabel={panelProps.networkFeeLabel ?? '—'}
            networkFeeNativeLabel={panelProps.networkFeeNativeLabel}
            gasFeeLabel={panelProps.gasFeeLabel ?? '—'}
            gasFeeNativeLabel={panelProps.gasFeeNativeLabel}
            protocolFeeLabel={panelProps.protocolFeeLabel}
            protocolFeeNativeLabel={panelProps.protocolFeeNativeLabel}
            warning={panelProps.warning}
            primaryLabel={panelProps.primaryLabel}
            primaryDisabled={panelProps.primaryDisabled || panelProps.unsupported}
            primaryLoading={panelProps.primaryLoading}
            isLoadingFee={feeLoading}
            onPrimary={panelProps.onPrimary}
            onBack={onBack}
          />
        </div>

        <div ref={measureRef} className="w-full">
          <BridgeSuccessPanel
            amount={panelProps.amount}
            token={panelProps.token}
            txnUrl={txnUrl}
            onBridgeMore={() => onReset?.()}
          />
        </div>
      </TransitionPanel>
    </BridgeStepShell>
  )
}
