import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { Theme } from '@/types'

interface UiState {
  theme: Theme
  sidebarOpen: boolean
  connectModalOpen: boolean
}

const initialState: UiState = {
  theme: 'system',
  sidebarOpen: false,
  connectModalOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setConnectModalOpen(state, action: PayloadAction<boolean>) {
      state.connectModalOpen = action.payload
    },
  },
})

export const { setTheme, setSidebarOpen, toggleSidebar, setConnectModalOpen } = uiSlice.actions
export const uiReducer = uiSlice.reducer
