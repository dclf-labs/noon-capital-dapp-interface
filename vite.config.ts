import path from 'node:path'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const nm = (...parts: string[]) => path.resolve(rootDir, 'node_modules', ...parts)

/**
 * Force every Lit import onto one physical module graph.
 * AppKit + Mysten otherwise pull both prod and `development/` Lit builds
 * (and/or duplicate optimized chunks), which crashes AppKit with
 * `h._$AT is not a function` and leaves an empty modal shell.
 */
function litSingletonPlugin(): Plugin {
  const lit = nm('lit/index.js')
  const litHtml = nm('lit-html/lit-html.js')
  const litElement = nm('lit-element/index.js')
  const reactiveElement = nm('@lit/reactive-element/reactive-element.js')

  return {
    name: 'lit-singleton',
    enforce: 'pre',
    resolveId(source) {
      if (source === 'lit' || source === 'lit/index.js') return lit
      if (
        source === 'lit-html' ||
        source === 'lit-html/lit-html.js' ||
        source === 'lit-html/development/lit-html.js' ||
        /(?:^|\/)lit-html-[A-Za-z0-9_-]+\.js$/.test(source)
      ) {
        return litHtml
      }
      if (
        source === 'lit-element' ||
        source === 'lit-element/index.js' ||
        source === 'lit-element/development/lit-element.js'
      ) {
        return litElement
      }
      if (
        source === '@lit/reactive-element' ||
        source === '@lit/reactive-element/reactive-element.js' ||
        source === '@lit/reactive-element/development/reactive-element.js'
      ) {
        return reactiveElement
      }
      if (source.includes('lit-html/development/')) {
        return nm('lit-html', source.split('lit-html/development/')[1] ?? 'lit-html.js')
      }
      if (source.includes('lit-element/development/')) {
        return nm('lit-element', source.split('lit-element/development/')[1] ?? 'index.js')
      }
      if (source.includes('@lit/reactive-element/development/')) {
        return nm(
          '@lit/reactive-element',
          source.split('@lit/reactive-element/development/')[1] ?? 'reactive-element.js',
        )
      }
      return undefined
    },
  }
}

const scopedCeRegistry = nm(
  '@webcomponents/scoped-custom-element-registry/scoped-custom-element-registry.min.js',
)

export default defineConfig({
  plugins: [litSingletonPlugin(), react(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      {
        find: /^@webcomponents\/scoped-custom-element-registry$/,
        replacement: scopedCeRegistry,
      },
    ],
    dedupe: [
      '@reown/appkit',
      '@reown/appkit-controllers',
      '@reown/appkit-common',
      '@reown/appkit-scaffold-ui',
      '@reown/appkit-ui',
      '@reown/appkit-utils',
      '@webcomponents/scoped-custom-element-registry',
      'lit',
      'lit-html',
      'lit-element',
      '@lit/reactive-element',
      '@lit/task',
      '@lit-labs/scoped-registry-mixin',
      '@nanostores/lit',
      'wagmi',
      'viem',
      'dayjs',
    ],
  },
  optimizeDeps: {
    include: [
      'dayjs',
      'lit',
      'lit-html',
      'lit-element',
      '@lit/reactive-element',
      'lit/decorators.js',
      'lit/directives/class-map.js',
      'lit/directives/when.js',
      'lit/directives/if-defined.js',
      'lit/directives/ref.js',
    ],
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    target: 'esnext',
    sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-dom') || id.includes('/react/')) {
            return 'react'
          }
          if (
            id.includes('@reown') ||
            id.includes('wagmi') ||
            id.includes('viem') ||
            id.includes('ethers')
          ) {
            return 'evm'
          }
          if (id.includes('starknet') || id.includes('starknetkit')) {
            return 'starknet'
          }
          if (id.includes('@mysten')) {
            return 'sui'
          }
          if (id.includes('@tanstack')) {
            return 'query'
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // Gate unit-testable pure modules (env, session, chain, address, config
      // registries, wallet project id / AppKit open). Feature hooks and large
      // formatter/query-key surfaces need separate integration coverage.
      include: [
        'src/lib/address.ts',
        'src/lib/chain.ts',
        'src/lib/env/**/*.ts',
        'src/lib/evm-submit.ts',
        'src/lib/evmTxn.ts',
        'src/lib/format.ts',
        'src/lib/gasFee.ts',
        'src/lib/secure-random.ts',
        'src/lib/sui-coin.ts',
        'src/lib/user.ts',
        'src/lib/utils.ts',
        'src/lib/wallet-query-sync.ts',
        'src/lib/wallet-session.ts',
        'src/lib/connection.ts',
        'src/state/**/*.ts',
        'src/chains/**/*.ts',
        'src/config/index.ts',
        'src/config/chain-id.ts',
        'src/config/helpers.ts',
        'src/config/chains/index.ts',
        'src/constants/**/*.ts',
        'src/features/_shared/trade-amounts.ts',
        'src/features/_shared/trade-display.ts',
        'src/features/_shared/use-trade-form-controller.ts',
        'src/features/swap/lib/amounts.ts',
        'src/features/swap/lib/ekubo-quote.ts',
        'src/features/swap/lib/spender.ts',
        'src/wallet/evm/open-appkit.ts',
        'src/wallet/evm/projectId.ts',
        'src/wallet/readers.ts',
        'src/wallet/useConnectWalletFamily.ts',
      ],
      exclude: ['src/**/*.d.ts', 'src/**/*.{test,spec}.{ts,tsx}', 'src/test/**'],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 60,
        statements: 75,
      },
    },
  },
})
