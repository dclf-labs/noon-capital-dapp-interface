import { motion } from 'motion/react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

/** Lightweight motion primitive — extend or swap with motion-primitives / aceternity later. */
export function FadeIn({ children, className, delay = 0, y = 12 }: FadeInProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
