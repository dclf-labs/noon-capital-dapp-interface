import { useSyncExternalStore } from 'react'

function createMediaStore(query: string) {
  let media: MediaQueryList | null = null

  const getMedia = () => {
    if (!media) media = window.matchMedia(query)
    return media
  }

  return {
    subscribe(onStoreChange: () => void) {
      const mql = getMedia()
      mql.addEventListener('change', onStoreChange)
      return () => mql.removeEventListener('change', onStoreChange)
    },
    getSnapshot() {
      return getMedia().matches
    },
    getServerSnapshot() {
      return false
    },
  }
}

const stores = new Map<string, ReturnType<typeof createMediaStore>>()

function getStore(query: string) {
  let store = stores.get(query)
  if (!store) {
    store = createMediaStore(query)
    stores.set(query, store)
  }
  return store
}

export function useMediaQuery(query: string) {
  const store = getStore(query)
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
}
