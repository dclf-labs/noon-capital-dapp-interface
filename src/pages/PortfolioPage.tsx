import { FadeIn } from '@/components/motion/fade-in'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectButton } from '@/components/web3/ConnectButton'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useNativeBalance } from '@/hooks/web3/useNativeBalance'
import { useWallet } from '@/hooks/web3/useWallet'
import { formatNumber, truncateAddress } from '@/lib/utils'

export function PortfolioPage() {
  useDocumentTitle('Portfolio')
  const { address, isConnected, chainMeta } = useWallet()
  const { formatted, symbol, isLoading } = useNativeBalance()

  return (
    <FadeIn className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Portfolio</h1>
        <p className="mt-1 text-muted-foreground">
          Wallet balances and Redux portfolio slice ready for protocol positions.
        </p>
      </div>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect to view portfolio</CardTitle>
            <CardDescription>
              Your positions will appear here once a wallet is connected.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectButton />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Wallet overview</CardTitle>
            <CardDescription>
              {truncateAddress(address ?? '')} on {chainMeta.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Native balance</p>
            <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">
              {isLoading
                ? '…'
                : `${formatNumber(formatted ?? 0, { maximumFractionDigits: 6 })} ${symbol ?? ''}`}
            </p>
          </CardContent>
        </Card>
      )}
    </FadeIn>
  )
}
