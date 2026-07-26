import { useAccount, useConnect, useDisconnect } from '@starknet-react/core'
import type { StarknetkitConnector } from 'starknetkit'
import { useStarknetkitConnectModal } from 'starknetkit'

export function useStarknetWallet() {
  const { address, status } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
  })

  async function connectWallet() {
    const { connector } = await starknetkitConnectModal()
    if (!connector) return
    await connect({ connector })
  }

  return {
    address,
    status,
    isConnected: Boolean(address),
    connect: connectWallet,
    disconnect,
  }
}
