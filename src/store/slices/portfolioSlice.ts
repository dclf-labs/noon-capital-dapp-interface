import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface PortfolioPosition {
  marketId: string
  amount: string
  valueUsd: number
  chainId: number
}

interface PortfolioState {
  totalValueUsd: number
  positions: PortfolioPosition[]
  isLoading: boolean
  lastUpdated: number | null
}

const initialState: PortfolioState = {
  totalValueUsd: 0,
  positions: [],
  isLoading: false,
  lastUpdated: null,
}

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolioLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    setPortfolio(
      state,
      action: PayloadAction<{ totalValueUsd: number; positions: PortfolioPosition[] }>,
    ) {
      state.totalValueUsd = action.payload.totalValueUsd
      state.positions = action.payload.positions
      state.isLoading = false
      state.lastUpdated = Date.now()
    },
    clearPortfolio(state) {
      state.totalValueUsd = 0
      state.positions = []
      state.lastUpdated = null
      state.isLoading = false
    },
  },
})

export const { setPortfolioLoading, setPortfolio, clearPortfolio } = portfolioSlice.actions
export const portfolioReducer = portfolioSlice.reducer
