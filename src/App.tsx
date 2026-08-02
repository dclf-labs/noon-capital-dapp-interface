import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { BridgePage } from '@/pages/bridge/BridgePage'
import { BridgeShell } from '@/pages/bridge/BridgeShell'
import { HomePage } from '@/pages/HomePage'
import { MintPage } from '@/pages/mint-redeem/MintPage'
import { MintRedeemShell } from '@/pages/mint-redeem/MintRedeemShell'
import { RedeemPage } from '@/pages/mint-redeem/RedeemPage'
import { StakePage } from '@/pages/stake-unstake/StakePage'
import { StakeUnstakeShell } from '@/pages/stake-unstake/StakeUnstakeShell'
import { UnstakePage } from '@/pages/stake-unstake/UnstakePage'
import { WithdrawPage } from '@/pages/stake-unstake/WithdrawPage'
import { BuyPage } from '@/pages/swap/BuyPage'
import { SellPage } from '@/pages/swap/SellPage'
import { SwapShell } from '@/pages/swap/SwapShell'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Buy / Sell (DEX swap) */}
        <Route path="/swap" element={<SwapShell />}>
          <Route index element={<Navigate to="buy" replace />} />
          <Route path="buy" element={<BuyPage />} />
          <Route path="sell" element={<SellPage />} />
        </Route>

        {/* Mint / Redeem (DirectMinter / DirectRedeemer — separate product surface) */}
        <Route element={<MintRedeemShell />}>
          <Route path="/mint" element={<MintPage />} />
          <Route path="/redeem" element={<RedeemPage />} />
        </Route>

        {/* Stake / Unstake / Withdraw (USN ↔ sUSN vault — separate product surface) */}
        <Route element={<StakeUnstakeShell />}>
          <Route path="/stake" element={<StakePage />} />
          <Route path="/unstake" element={<UnstakePage />} />
          <Route path="/withdraw" element={<WithdrawPage />} />
        </Route>

        {/* Bridge (Hyperlane / LayerZero — separate product surface) */}
        <Route element={<BridgeShell />}>
          <Route path="/bridge" element={<BridgePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
