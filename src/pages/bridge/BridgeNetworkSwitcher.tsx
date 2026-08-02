import { chainList, isEvmChain } from '@/chains'
import { useSelectActiveChain } from '@/hooks/connection'
import { type ChainId, getChainConfig, getStarknetChainId, getSuiChainId } from '@/lib/chain'
import * as styles from '@/pages/bridge/bridge-styles'

function protocolIdForChainKey(key: (typeof chainList)[number]['key']): ChainId {
  if (key === 'starknet') return getStarknetChainId()!
  if (key === 'sui') return getSuiChainId()!
  const chain = chainList.find((entry) => entry.key === key)
  if (chain && isEvmChain(chain)) return chain.chainId
  throw new Error(`Unknown chain key: ${key}`)
}

function isBridgeNetwork(key: (typeof chainList)[number]['key']): boolean {
  const protocolId = protocolIdForChainKey(key)
  const config = getChainConfig(protocolId)
  return Boolean(config.bridgeTokens?.length)
}

/** Active product network for bridge (EVM + Starknet + Sui). */
export function BridgeNetworkSwitcher() {
  const { selectedChainId, selectActiveChain, isSwitchingEvmNetwork } = useSelectActiveChain()
  const networks = chainList.filter((chain) => isBridgeNetwork(chain.key))

  return (
    <section style={{ display: 'grid', gap: 8 }}>
      <div style={styles.row}>
        <strong style={{ fontSize: 14 }}>Wallet network</strong>
        {isSwitchingEvmNetwork ? <span style={styles.muted}>switching…</span> : null}
      </div>
      <div style={styles.row}>
        {networks.map((chain) => {
          const protocolId = protocolIdForChainKey(chain.key)
          const selected = Number(selectedChainId) === Number(protocolId)
          return (
            <button
              key={chain.key}
              type="button"
              onClick={() => void selectActiveChain(protocolId)}
              style={{
                ...styles.buttonSecondary,
                ...(selected ? { background: '#111', color: '#fff', borderColor: '#111' } : null),
                fontSize: 13,
                padding: '6px 10px',
              }}
            >
              {chain.name}
            </button>
          )
        })}
      </div>
    </section>
  )
}
