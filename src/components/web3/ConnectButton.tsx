import { AlertTriangle, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useConnect } from 'wagmi'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChainSwitcher } from '@/components/web3/ChainSwitcher'
import { useWallet } from '@/hooks/web3/useWallet'
import { env } from '@/lib/env'
import { truncateAddress } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setConnectModalOpen } from '@/store/slices/uiSlice'

export function ConnectButton() {
  const dispatch = useAppDispatch()
  const open = useAppSelector((s) => s.ui.connectModalOpen)
  const {
    address,
    isConnected,
    isConnecting,
    disconnect,
    chainMeta,
    isUnsupportedChain,
    switchChainAsync,
    chains,
  } = useWallet()
  const { connectors, connectAsync, isPending } = useConnect()
  const walletConnectEnabled = Boolean(env.VITE_WALLETCONNECT_PROJECT_ID)

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {isUnsupportedChain ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              const fallback = chains[0]
              if (!fallback) return
              try {
                await switchChainAsync({ chainId: fallback.id })
                toast.success(`Switched to ${fallback.name}`)
              } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to switch chain'
                toast.error(message)
              }
            }}
          >
            <AlertTriangle />
            Wrong network
          </Button>
        ) : (
          <ChainSwitcher />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="font-mono">
              <span
                className="mr-1 size-2 rounded-full"
                style={{ backgroundColor: chainMeta.color }}
              />
              {truncateAddress(address)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Wallet</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(address)
                  toast.success('Address copied')
                } catch {
                  toast.error('Could not copy address')
                }
              }}
            >
              Copy address
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                disconnect()
                toast.message('Wallet disconnected')
              }}
            >
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => dispatch(setConnectModalOpen(next))}>
      <DialogTrigger asChild>
        <Button disabled={isConnecting || isPending}>
          <Wallet />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to Noon Capital across supported chains.
          </DialogDescription>
        </DialogHeader>
        {!walletConnectEnabled ? (
          <p className="text-xs text-muted-foreground">
            WalletConnect is unavailable until `VITE_WALLETCONNECT_PROJECT_ID` is set.
          </p>
        ) : null}
        <div className="grid gap-2">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              variant="outline"
              className="justify-start"
              disabled={isPending}
              onClick={async () => {
                try {
                  await connectAsync({ connector })
                  dispatch(setConnectModalOpen(false))
                  toast.success(`Connected with ${connector.name}`)
                } catch (error) {
                  const message = error instanceof Error ? error.message : 'Connection failed'
                  toast.error(message)
                }
              }}
            >
              {connector.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
