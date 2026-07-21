import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { RouterProvider } from 'react-router-dom'

import { router } from '@/app/router'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { env } from '@/lib/env'
import { AppProviders } from '@/providers/AppProviders'

import '@/styles/globals.css'

// Validate env at boot (throws with a clear message if misconfigured)
void env

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
)
