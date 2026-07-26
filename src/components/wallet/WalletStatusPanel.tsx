import { ConnectButton } from '@mysten/dapp-kit-react/ui'
import { AppKitButton } from '@reown/appkit/react'

import { chainList } from '@/chains'
import { useMultiChainClient } from '@/wallet'
import { useStarknetWallet } from '@/wallet/starknet/useStarknetWallet'

function truncate(value: string | undefined) {
  if (!value) return '—'
  if (value.length < 12) return value
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}

export function WalletStatusPanel() {
  const multi = useMultiChainClient()
  const starknet = useStarknetWallet()

  const evm = multi.getWalletSession('evm')
  const sn = multi.getWalletSession('starknet')
  const sui = multi.getWalletSession('sui')

  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 720, padding: 24, fontFamily: 'system-ui' }}>
      <header>
        <h1 style={{ margin: 0 }}>noon.capital</h1>
        <p style={{ margin: '8px 0 0', opacity: 0.7 }}>
          Multi-chain wallet foundation (EVM AppKit · Starknet · Sui)
        </p>
      </header>

      <section style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>EVM (AppKit + wagmi + viem + ethers)</h2>
        <AppKitButton />
        <p style={{ margin: 0, fontSize: 14 }}>
          Connected: {truncate(evm.address)} {evm.networkLabel ? `(${evm.networkLabel})` : ''}
        </p>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Starknet (starknet-react + starknetkit)</h2>
        {starknet.isConnected ? (
          <button type="button" onClick={() => void starknet.disconnect()}>
            Disconnect Starknet
          </button>
        ) : (
          <button type="button" onClick={() => void starknet.connect()}>
            Connect Starknet
          </button>
        )}
        <p style={{ margin: 0, fontSize: 14 }}>
          Connected: {truncate(sn.address)} {sn.networkLabel ? `(${sn.networkLabel})` : ''}
        </p>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Sui (@mysten/dapp-kit-react)</h2>
        <ConnectButton />
        <p style={{ margin: 0, fontSize: 14 }}>
          Connected: {truncate(sui.address)} {sui.networkLabel ? `(${sui.networkLabel})` : ''}
        </p>
      </section>

      <section style={{ display: 'grid', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Registered chains</h2>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
          {chainList.map((chain) => (
            <li key={chain.key}>
              <strong>{chain.name}</strong> · {chain.family}
              {chain.family === 'evm' ? ` · ${chain.chainId}` : ''}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
