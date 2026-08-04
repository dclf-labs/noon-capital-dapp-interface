import { motion, useReducedMotion } from 'motion/react'

/**
 * Figma `4819:60244` success tile + check asset, with a soft entrance.
 * Keeps `/assets/buy/check-circle.svg` unchanged. Honors reduced motion.
 */
export function SuccessCheckIcon() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-success-soft"
      initial={reduceMotion ? false : { scale: 0.72, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={
        reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 22, mass: 0.7 }
      }
      aria-hidden
    >
      <motion.img
        src="/assets/buy/check-circle.svg"
        alt=""
        width={24}
        height={24}
        className="size-6"
        initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 420, damping: 18, mass: 0.55, delay: 0.06 }
        }
      />
    </motion.div>
  )
}
