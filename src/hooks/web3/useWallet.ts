import { useAccount, useChainId, useDisconnect, useSwitchChain } from 'wagmi'

import { getChainMeta } from '@/lib/web3/chains'
import { isSupportedChainId } from '@/lib/web3/config'

export function useWallet() {
  const { address, isConnected, isConnecting, isReconnecting, status, connector, chain } =
    useAccount()
  const chainId = useChainId()
  const { disconnect, disconnectAsync, isPending: isDisconnecting } = useDisconnect()
  const { switchChain, switchChainAsync, isPending: isSwitching, chains } = useSwitchChain()

  const isUnsupportedChain = isConnected && !isSupportedChainId(chainId)
  const chainMeta = getChainMeta(chainId)

  return {
    address,
    isConnected,
    isConnecting,
    isReconnecting,
    isDisconnecting,
    isSwitching,
    isUnsupportedChain,
    status,
    connector,
    chain,
    chainId,
    chainMeta,
    chains,
    disconnect,
    disconnectAsync,
    switchChain,
    switchChainAsync,
  }
}
