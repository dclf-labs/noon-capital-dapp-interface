import path from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
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
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router')) {
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
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/App.tsx', 'src/vite-env.d.ts', 'src/**/*.d.ts', 'src/test/**'],
    },
  },
})
