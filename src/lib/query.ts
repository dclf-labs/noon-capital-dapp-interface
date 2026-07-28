import { QueryClient } from '@tanstack/react-query'

/** Shared TanStack Query client for EVM + Starknet (and future chain readers). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})
