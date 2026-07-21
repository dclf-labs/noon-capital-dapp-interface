import { useMediaQuery } from '@/hooks/useMediaQuery'

export function useIsMobile(breakpoint = 768) {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`)
}
