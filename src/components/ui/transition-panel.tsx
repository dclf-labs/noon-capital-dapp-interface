import { Children, type ReactNode } from 'react'

import {
  AnimatePresence,
  motion,
  type MotionProps,
  type Transition,
  useReducedMotion,
  type Variant,
} from 'motion/react'

import { cn } from '@/lib/utils'

/** Shared TransactionFlow spring slide (no height tween). */
const TRANSITION_PANEL_DEFAULT: Transition = {
  x: { type: 'spring', stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
}

const TRANSITION_PANEL_VARIANTS: {
  enter: Variant
  center: Variant
  exit: Variant
} = {
  enter: (direction: number) => ({
    x: direction > 0 ? 364 : -364,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 364 : -364,
    opacity: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  }),
}

const REDUCED_MOTION_TRANSITION: Transition = { duration: 0.12 }

const REDUCED_MOTION_VARIANTS: {
  enter: Variant
  center: Variant
  exit: Variant
} = {
  enter: { opacity: 0 },
  center: { opacity: 1, zIndex: 1 },
  exit: { opacity: 0, position: 'absolute', top: 0, width: '100%' },
}

export type TransitionPanelProps = {
  children: ReactNode
  className?: string
  panelClassName?: string
  transition?: Transition
  activeIndex: number
  /** Slide direction: `1` forward, `-1` back. Also accepted via `custom`. */
  direction?: number
  variants?: { enter: Variant; center: Variant; exit: Variant }
} & Omit<MotionProps, 'children' | 'variants' | 'transition'>

/**
 * Indexed step panel — `popLayout` + spring x.
 */
export function TransitionPanel({
  children,
  className,
  panelClassName,
  transition = TRANSITION_PANEL_DEFAULT,
  variants = TRANSITION_PANEL_VARIANTS,
  activeIndex,
  direction = 1,
  custom,
  ...motionProps
}: TransitionPanelProps) {
  const reduceMotion = useReducedMotion()
  const panels = Children.toArray(children)
  const active = panels[activeIndex]
  const slideCustom = custom ?? direction

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence initial={false} mode="popLayout" custom={slideCustom}>
        <motion.div
          key={activeIndex}
          className={cn(panelClassName)}
          custom={slideCustom}
          variants={reduceMotion ? REDUCED_MOTION_VARIANTS : variants}
          transition={reduceMotion ? REDUCED_MOTION_TRANSITION : transition}
          initial="enter"
          animate="center"
          exit="exit"
          {...motionProps}
        >
          {active}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
