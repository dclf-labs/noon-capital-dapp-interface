import { type ReactNode } from 'react'

import { Provider as ReduxProvider } from 'react-redux'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { Web3Provider } from '@/providers/Web3Provider'
import { store } from '@/store'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <Web3Provider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </Web3Provider>
      </ThemeProvider>
    </ReduxProvider>
  )
}
