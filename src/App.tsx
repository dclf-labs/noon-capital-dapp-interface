import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { HomePage } from '@/pages/HomePage'
import { BuyPage } from '@/pages/swap/BuyPage'
import { SellPage } from '@/pages/swap/SellPage'
import { SwapShell } from '@/pages/swap/SwapShell'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/swap" element={<SwapShell />}>
          <Route index element={<Navigate to="buy" replace />} />
          <Route path="buy" element={<BuyPage />} />
          <Route path="sell" element={<SellPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
