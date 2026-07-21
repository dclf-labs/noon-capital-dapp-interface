import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { MarketSummary } from '@/types'

interface MarketsState {
  items: MarketSummary[]
  selectedMarketId: string | null
  isLoading: boolean
  error: string | null
}

const initialState: MarketsState = {
  items: [],
  selectedMarketId: null,
  isLoading: false,
  error: null,
}

const marketsSlice = createSlice({
  name: 'markets',
  initialState,
  reducers: {
    setMarketsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
      if (action.payload) state.error = null
    },
    setMarkets(state, action: PayloadAction<MarketSummary[]>) {
      state.items = action.payload
      state.isLoading = false
      state.error = null
    },
    setSelectedMarketId(state, action: PayloadAction<string | null>) {
      state.selectedMarketId = action.payload
    },
    setMarketsError(state, action: PayloadAction<string>) {
      state.error = action.payload
      state.isLoading = false
    },
  },
})

export const { setMarketsLoading, setMarkets, setSelectedMarketId, setMarketsError } =
  marketsSlice.actions
export const marketsReducer = marketsSlice.reducer
