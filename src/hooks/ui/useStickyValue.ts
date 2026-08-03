import { useState } from 'react'

/**
 * Keep showing the last defined value while a newer value is temporarily
 * unavailable (e.g. fee/quote refetch on chain switch) — avoids `—` / skeleton flash.
 *
 * Pass `resetKey` (route / token identity) so a real identity change drops the
 * previous sticky value instead of showing a stale fee from another route.
 */
export function useStickyValue<T>(value: T | undefined, resetKey?: string): T | undefined {
  const [state, setState] = useState({ sticky: value, key: resetKey })

  if (resetKey !== undefined && resetKey !== state.key) {
    setState({ sticky: value, key: resetKey })
  } else if (value !== undefined && value !== state.sticky) {
    setState({ sticky: value, key: state.key })
  }

  return value !== undefined ? value : state.sticky
}
