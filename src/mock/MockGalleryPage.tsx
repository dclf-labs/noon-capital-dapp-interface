import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'

import type { Token } from '@/config/token'
import { BridgePanel } from '@/mock/bridge/BridgePanel'
import { MintRedeemPanel } from '@/mock/mint-redeem/MintRedeemPanel'
import { StakeUnstakePanel } from '@/mock/stake-unstake/StakeUnstakePanel'
import { TradePanelView } from '@/mock/swap/TradePanelView'

const noop = () => undefined

const usdc: Token = {
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
  iconSlug: 'usdc',
  contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Token['contractAddress'],
}

const usn: Token = {
  symbol: 'USN',
  name: 'USN',
  decimals: 18,
  iconSlug: 'usn',
  contractAddress: '0xdA67B4284609d2d48e5d10cfAc411572727dc1eD' as Token['contractAddress'],
}

const susn: Token = {
  symbol: 'sUSN',
  name: 'sUSN',
  decimals: 18,
  iconSlug: 'susn',
  contractAddress: '0x0000000000000000000000000000000000000001' as Token['contractAddress'],
}

const section: CSSProperties = {
  display: 'grid',
  gap: 12,
  padding: 16,
  border: '1px solid #ddd',
  borderRadius: 8,
  background: '#fafafa',
}

const page: CSSProperties = {
  fontFamily: 'system-ui, sans-serif',
  padding: 24,
  display: 'grid',
  gap: 24,
  maxWidth: 720,
  margin: '0 auto',
}

/**
 * Local gallery of presentational product panels with stubbed props.
 * No wallet / quote wiring — for visual QA of `src/mock/*` UI.
 */
export function MockGalleryPage() {
  return (
    <div style={page}>
      <header style={{ display: 'grid', gap: 8 }}>
        <Link to="/" style={{ color: '#111', fontSize: 14 }}>
          ← Home
        </Link>
        <h1 style={{ margin: 0, fontSize: 22 }}>UI mock gallery</h1>
        <p style={{ margin: 0, color: '#555', fontSize: 14 }}>
          Presentational panels from <code>src/mock/</code> with fake amounts. Live flows stay under{' '}
          <code>/swap</code>, <code>/mint</code>, <code>/stake</code>, <code>/bridge</code>.
        </p>
      </header>

      <section style={section}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Buy / Sell — TradePanelView</h2>
        <TradePanelView
          mode="buy"
          step={0}
          isConnected
          tokenIn={usdc}
          tokenOut={usn}
          tokensIn={[usdc]}
          tokensOut={[usn]}
          amountIn={1234.567891}
          amountOut={1233.456789}
          amountInUsd={1234.56}
          balanceInLabel="Bal: 10,000.00 USDC"
          isFetchingQuote={false}
          isInsufficientBalance={false}
          isApproved
          primaryLabel="Next"
          primaryDisabled={false}
          onAmountInChange={noop}
          onHalf={noop}
          onMax={noop}
          onTokenInChange={noop}
          onTokenOutChange={noop}
          onPrimary={noop}
        />
      </section>

      <section style={section}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Mint / Redeem — MintRedeemPanel</h2>
        <MintRedeemPanel
          mode="mint"
          step={0}
          isConnected
          tokenIn={usdc}
          tokenOut={usn}
          variableTokens={[usdc]}
          amountIn={500.123456}
          amountOut={499.875}
          amountInUsd={500.12}
          isFetchingQuote={false}
          isInsufficientBalance={false}
          isApproved
          isWhitelisted
          primaryLabel="Next"
          primaryDisabled={false}
          onAmountInChange={noop}
          onHalf={noop}
          onMax={noop}
          onVariableTokenChange={noop}
          onPrimary={noop}
        />
      </section>

      <section style={section}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Stake / Unstake — StakeUnstakePanel</h2>
        <StakeUnstakePanel
          mode="stake"
          step={0}
          isConnected
          tokenIn={usn}
          tokenOut={susn}
          amountIn={100.123456}
          amountOut={99.5}
          amountInUsd={100.12}
          isFetchingQuote={false}
          isInsufficientBalance={false}
          isApproved
          requiresApproval
          primaryLabel="Next"
          primaryDisabled={false}
          onAmountInChange={noop}
          onHalf={noop}
          onMax={noop}
          onPrimary={noop}
        />
      </section>

      <section style={section}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Bridge — BridgePanel</h2>
        <BridgePanel
          step={0}
          isConnected
          sourceNetworks={[
            { id: 1, name: 'Ethereum' },
            { id: 8453, name: 'Base' },
          ]}
          destinationNetworks={[
            { id: 324, name: 'zkSync' },
            { id: 8453, name: 'Base' },
          ]}
          sourceChainId={1}
          destinationChainId={324}
          onSourceChange={noop}
          onDestinationChange={noop}
          tokens={[susn]}
          token={susn}
          onTokenChange={noop}
          amount={12.345678}
          amountUsd={12.34}
          balanceInLabel="Bal: 1,000.00 sUSN"
          receiverLabel="EVM receiver"
          receiverValue="0x1111111111111111111111111111111111111111"
          receiverPlaceholder="0x…"
          onReceiverChange={noop}
          protocolLabel="Hyperlane"
          isFetchingFee={false}
          isInsufficientBalance={false}
          primaryLabel="Next"
          primaryDisabled={false}
          onAmountChange={noop}
          onHalf={noop}
          onMax={noop}
          onPrimary={noop}
        />
      </section>
    </div>
  )
}
