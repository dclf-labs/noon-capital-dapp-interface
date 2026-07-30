import type { ChainFamily } from '@/chains'
import { openEvmAppKit } from '@/wallet/evm/open-appkit'

const CHAIN_FAMILY_OPTIONS: ReadonlyArray<{
  family: ChainFamily
  title: string
  description: string
}> = [
  {
    family: 'evm',
    title: 'Ethereum (EVM)',
    description: 'Ethereum, Base, zkSync, and other EVM chains',
  },
  {
    family: 'starknet',
    title: 'Starknet',
    description: 'Argent, Braavos, and other Starknet wallets',
  },
  {
    family: 'sui',
    title: 'Sui',
    description: 'Sui Wallet, Slush, and other Sui wallets',
  },
]

/**
 * Chain-family picker shown before a wallet connect UI.
 * EVM opens AppKit directly in the click handler (user-gesture safe).
 * Starknet / Sui are handed to `onSelect` for hook-based connect UIs.
 */
export default function ChainFamilySelectorModal({
  isOpen = false,
  onOpenChange,
  onSelect,
}: {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onSelect?: (family: ChainFamily) => void
}) {
  if (!isOpen) return null

  function close() {
    onOpenChange?.(false)
  }

  async function selectFamily(family: ChainFamily) {
    // Dismiss our overlay first so it cannot cover AppKit (z-index 1000).
    // Then open AppKit in the same click-handler task (no useEffect deferral).
    if (family === 'evm') {
      close()
      try {
        await openEvmAppKit()
      } catch (error) {
        console.error('[wallet] failed to open EVM AppKit', error)
      }
      return
    }

    close()
    onSelect?.(family)
  }

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        padding: 16,
      }}
      onClick={close}
      onKeyDown={(event) => {
        if (event.key === 'Escape') close()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chain-family-selector-title"
        style={{
          width: 'min(100%, 420px)',
          display: 'grid',
          gap: 12,
          padding: 20,
          borderRadius: 12,
          background: '#fff',
          color: '#111',
          boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'grid', gap: 4 }}>
          <h2 id="chain-family-selector-title" style={{ margin: 0, fontSize: 18 }}>
            Choose a network
          </h2>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>
            Select which network to connect, then pick a wallet.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {CHAIN_FAMILY_OPTIONS.map((option) => (
            <button
              key={option.family}
              type="button"
              onClick={() => void selectFamily(option.family)}
              style={{
                display: 'grid',
                gap: 2,
                textAlign: 'left',
                padding: '12px 14px',
                borderRadius: 8,
                border: '1px solid #ddd',
                background: '#fafafa',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontWeight: 600 }}>{option.title}</span>
              <span style={{ fontSize: 13, opacity: 0.7 }}>{option.description}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={close}
          style={{
            justifySelf: 'end',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
