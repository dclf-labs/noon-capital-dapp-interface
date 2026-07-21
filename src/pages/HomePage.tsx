import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { FadeIn } from '@/components/motion/fade-in'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConnectButton } from '@/components/web3/ConnectButton'
import { ROUTES } from '@/constants'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getChainMeta } from '@/lib/web3/chains'
import { supportedChains } from '@/lib/web3/config'

export function HomePage() {
  useDocumentTitle()
  return (
    <div className="space-y-12">
      <FadeIn className="max-w-2xl space-y-5">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Multichain capital markets
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Deploy capital across chains from one interface
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Noon Capital is structured for modular markets, portfolio state, and wallet-native
          workflows — built on React, wagmi, and a clean feature-oriented codebase.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ConnectButton />
          <Button variant="outline" asChild>
            <Link to={ROUTES.markets}>
              Explore markets
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>Supported networks</CardTitle>
            <CardDescription>
              Wagmi is preconfigured for production L1/L2s plus Sepolia for testing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {supportedChains.map((chain) => {
                const meta = getChainMeta(chain.id)
                return (
                  <li
                    key={chain.id}
                    className="flex items-center gap-3 rounded-lg border border-border/80 px-3 py-2.5"
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    <div>
                      <p className="text-sm font-medium">{meta.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">Chain ID {chain.id}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
