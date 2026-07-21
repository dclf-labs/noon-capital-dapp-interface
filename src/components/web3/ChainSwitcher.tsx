import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWallet } from '@/hooks/web3/useWallet'
import { getChainMeta } from '@/lib/web3/chains'

export function ChainSwitcher() {
  const { chainId, chains, switchChainAsync, isSwitching, isConnected } = useWallet()

  if (!isConnected) return null

  const current = getChainMeta(chainId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isSwitching}>
          <span className="size-2 rounded-full" style={{ backgroundColor: current.color }} />
          {current.shortName}
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Switch network</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {chains.map((chain) => {
          const meta = getChainMeta(chain.id)
          const active = chain.id === chainId
          return (
            <DropdownMenuItem
              key={chain.id}
              disabled={active || isSwitching}
              onClick={async () => {
                try {
                  await switchChainAsync({ chainId: chain.id })
                  toast.success(`Switched to ${meta.name}`)
                } catch (error) {
                  const message = error instanceof Error ? error.message : 'Failed to switch chain'
                  toast.error(message)
                }
              }}
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: meta.color }} />
              {meta.name}
              {active ? (
                <span className="ml-auto text-xs text-muted-foreground">Active</span>
              ) : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
