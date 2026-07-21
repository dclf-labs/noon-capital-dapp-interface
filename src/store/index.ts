import { combineReducers, configureStore } from '@reduxjs/toolkit'

import { isDev } from '@/lib/env'

import { marketsReducer } from './slices/marketsSlice'
import { portfolioReducer } from './slices/portfolioSlice'
import { uiReducer } from './slices/uiSlice'

const rootReducer = combineReducers({
  ui: uiReducer,
  portfolio: portfolioReducer,
  markets: marketsReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export function createAppStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [],
        },
      }),
    devTools: isDev,
  })
}

export const store = createAppStore()

export type AppStore = ReturnType<typeof createAppStore>
export type AppDispatch = AppStore['dispatch']
