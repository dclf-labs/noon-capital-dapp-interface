import { useLayoutEffect, useState } from 'react'

/** Measure an element's content box via ResizeObserver (callback ref). */
export function useElementSize<T extends HTMLElement = HTMLDivElement>() {
  const [node, setNode] = useState<T | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    if (!node) return

    const update = () => {
      const rect = node.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }

    update()

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  return [setNode, size] as const
}
