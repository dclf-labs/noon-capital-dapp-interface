import { useDAppKit } from '@mysten/dapp-kit-react'
import { useDisconnect as useEvmDisconnect } from 'wagmi'

import { chainList, isEvmChain } from '@/chains'
import { useChainFamilySelectorModal } from '@/features/shell'
import { useSelectActiveChain } from '@/hooks/connection'
import { type ChainId, getChainConfig, getStarknetChainId, getSuiChainId } from '@/lib/chain'
import { truncateAddress } from '@/lib/utils'
import { useMultiChainClient } from '@/wallet'
import { wagmiAdapter } from '@/wallet/evm/config'
import { useStarknetWallet } from '@/wallet/starknet/useStarknetWallet'

function displayAddress(value: string | undefined) {
  return value ? truncateAddress(value) : '—'
}

function protocolIdForChainKey(key: (typeof chainList)[number]['key']): ChainId {
  if (key === 'starknet') return getStarknetChainId()!
  if (key === 'sui') return getSuiChainId()!
  const chain = chainList.find((entry) => entry.key === key)
  if (chain && isEvmChain(chain)) return chain.chainId
  throw new Error(`Unknown chain key: ${key}`)
}

export function WalletStatusPanel() {
  const multi = useMultiChainClient()
  const chainFamilyModal = useChainFamilySelectorModal()
  const starknet = useStarknetWallet()
  const { disconnect: disconnectEvm } = useEvmDisconnect({ config: wagmiAdapter.wagmiConfig })
  const suiKit = useDAppKit()
  const { selectedChainId, selectActiveChain, isSwitchingEvmNetwork } = useSelectActiveChain()

  const evm = multi.getWalletSession('evm')
  const sn = multi.getWalletSession('starknet')
  const sui = multi.getWalletSession('sui')
  const activeConfig = getChainConfig(selectedChainId)

  return (
    <div
      style={{ display: 'grid', gap: 24, maxWidth: 720, padding: 24, fontFamily: 'var(--font-s)' }}
    >
      <header>
        <h1 style={{ margin: 0 }}>noon.capital</h1>
        <p style={{ margin: '8px 0 0', opacity: 0.7 }}>
          Multi-chain wallet foundation (EVM AppKit · Starknet · Sui)
        </p>
      </header>

      <section style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Active network</h2>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>
          Default is Ethereum. With an EVM wallet connected, the dapp follows that network; pick any
          network here (kept across pages) to update the dapp — EVM picks also switch the wallet.
          Current: <strong>{activeConfig.name}</strong>
          {isSwitchingEvmNetwork ? ' · switching…' : ''}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {chainList.map((chain) => {
            const protocolId = protocolIdForChainKey(chain.key)
            const selected = Number(selectedChainId) === Number(protocolId)
            return (
              <button
                key={chain.key}
                type="button"
                onClick={() => void selectActiveChain(protocolId)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: selected ? '2px solid #111' : '1px solid #ddd',
                  background: selected ? '#111' : '#fafafa',
                  color: selected ? '#fff' : '#111',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {chain.name}
              </button>
            )
          })}
        </div>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>Wallet</h2>
        <button
          type="button"
          onClick={chainFamilyModal.onOpen}
          style={{
            justifySelf: 'start',
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #111',
            background: '#111',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Connect wallet
        </button>

        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
          <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 14 }}>
            <span style={{ minWidth: 72, fontWeight: 600 }}>EVM</span>
            <span style={{ flex: 1 }}>
              {displayAddress(evm.address)}
              {evm.networkLabel ? ` (${evm.networkLabel})` : ''}
            </span>
            {evm.isConnected ? (
              <button type="button" onClick={() => disconnectEvm()}>
                Disconnect
              </button>
            ) : null}
          </li>
          <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 14 }}>
            <span style={{ minWidth: 72, fontWeight: 600 }}>Starknet</span>
            <span style={{ flex: 1 }}>
              {displayAddress(sn.address)}
              {sn.networkLabel ? ` (${sn.networkLabel})` : ''}
            </span>
            {sn.isConnected ? (
              <button type="button" onClick={() => void starknet.disconnect()}>
                Disconnect
              </button>
            ) : null}
          </li>
          <li style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 14 }}>
            <span style={{ minWidth: 72, fontWeight: 600 }}>Sui</span>
            <span style={{ flex: 1 }}>
              {displayAddress(sui.address)}
              {sui.networkLabel ? ` (${sui.networkLabel})` : ''}
            </span>
            {sui.isConnected ? (
              <button type="button" onClick={() => void suiKit.disconnectWallet()}>
                Disconnect
              </button>
            ) : null}
          </li>
        </ul>
      </section>
    </div>
  )
}
