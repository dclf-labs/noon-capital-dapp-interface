/* Polyfill + AppKit must load before React / Mysten UI (Lit CE registry). */
/* eslint-disable simple-import-sort/imports */
import '@webcomponents/scoped-custom-element-registry'
import '@/wallet/evm/config'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from '@/App'
import { AppProviders } from '@/providers/AppProviders'

import '@/styles/globals.css'
/* eslint-enable simple-import-sort/imports */

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
