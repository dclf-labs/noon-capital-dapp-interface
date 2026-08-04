import { motion, useReducedMotion } from 'motion/react'

/** Shell / panel ease — smooth decelerate, no spring bounce. */
const SMOOTH_EASE = [0.22, 1, 0.36, 1] as const

/**
 * Figma `4819:60244` success tile + check asset.
 * Soft scale/fade entrance only — keeps `/assets/buy/check-circle.svg` unchanged.
 * Used on buy / bridge (and any other) final success step. Honors reduced motion.
 */
export function SuccessCheckIcon() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-success-soft"
      initial={reduceMotion ? false : { scale: 0.88, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : // Short delay so the step slide can settle first.
            { duration: 0.5, ease: SMOOTH_EASE, delay: 0.1 }
      }
      style={{ transformOrigin: 'center' }}
      aria-hidden
    >
      <motion.img
        src="/assets/buy/check-circle.svg"
        alt=""
        width={24}
        height={24}
        className="size-6"
        initial={reduceMotion ? false : { scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.45, ease: SMOOTH_EASE, delay: 0.18 }
        }
        style={{ transformOrigin: 'center' }}
      />
    </motion.div>
  )
}
