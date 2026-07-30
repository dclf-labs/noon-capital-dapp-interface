import { lazy, Suspense, useEffect, useRef } from 'react'

const LazySuiConnectModal = lazy(async () => {
  const { ConnectModal } = await import('@mysten/dapp-kit-react/ui')
  return {
    default: function SuiConnectModal({ onClose }: { onClose: () => void }) {
      const ref = useRef<HTMLElement | null>(null)

      useEffect(() => {
        const el = ref.current
        if (!el) return
        const handleClosed = () => onClose()
        el.addEventListener('closed', handleClosed)
        return () => el.removeEventListener('closed', handleClosed)
      }, [onClose])

      // Mysten ConnectModal is a Lit element; `closed` is not typed on the React wrapper.
      return <ConnectModal open ref={ref as never} />
    },
  }
})

/** Controlled Sui wallet connect modal (Mysten dApp Kit). */
export default function SuiWalletSelector({
  isOpen = false,
  onOpenChange,
}: {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  // Lazy-load Mysten web components only when opening Sui connect,
  // so their Lit stack is not evaluated during AppKit bootstrap.
  if (!isOpen) return null

  return (
    <Suspense fallback={null}>
      <LazySuiConnectModal onClose={() => onOpenChange?.(false)} />
    </Suspense>
  )
}
