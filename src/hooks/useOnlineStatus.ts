import { useCallback, useSyncExternalStore } from 'react'

function subscribe(onStoreChange: () => void) {
  window.addEventListener('online', onStoreChange)
  window.addEventListener('offline', onStoreChange)
  return () => {
    window.removeEventListener('online', onStoreChange)
    window.removeEventListener('offline', onStoreChange)
  }
}

function getSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true
}

export function useOnlineStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const assertOnline = useCallback(() => {
    if (!isOnline) {
      throw new Error('You appear to be offline. Check your connection and try again.')
    }
  }, [isOnline])

  return { isOnline, assertOnline }
}
