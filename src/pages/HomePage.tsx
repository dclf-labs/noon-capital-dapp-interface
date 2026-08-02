import { Link } from 'react-router-dom'

import { WalletStatusPanel } from '@/components/wallet/WalletStatusPanel'

export function HomePage() {
  return (
    <div>
      <div
        style={{
          padding: '16px 24px 0',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <Link to="/swap/buy" style={{ color: '#111', fontSize: 14 }}>
          Open Buy / Sell →
        </Link>
        <Link to="/mint" style={{ color: '#111', fontSize: 14 }}>
          Open Mint / Redeem →
        </Link>
        <Link to="/stake" style={{ color: '#111', fontSize: 14 }}>
          Open Stake / Unstake →
        </Link>
        <Link to="/bridge" style={{ color: '#111', fontSize: 14 }}>
          Open Bridge →
        </Link>
      </div>
      <WalletStatusPanel />
    </div>
  )
}
