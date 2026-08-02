import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { HomePage } from '@/pages/HomePage'
import { MintPage } from '@/pages/mint-redeem/MintPage'
import { MintRedeemShell } from '@/pages/mint-redeem/MintRedeemShell'
import { RedeemPage } from '@/pages/mint-redeem/RedeemPage'
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
