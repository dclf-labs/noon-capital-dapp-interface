import * as HoverCardPrimitive from '@radix-ui/react-hover-card'
import type { ComponentProps } from 'react'

import { TIP_COLLISION_PADDING_PX, TIP_Z_INDEX } from '@/components/shell/constants'
import { cn } from '@/lib/utils'

function HoverCard({ ...props }: ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({ ...props }: ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
}

function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 6,
  collisionPadding = TIP_COLLISION_PADDING_PX,
  style,
  ...props
}: ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        style={{ ...style, zIndex: TIP_Z_INDEX }}
        className={cn(
          'w-auto max-w-[min(100vw-1.5rem,280px)] rounded-lg border border-[#d4d1cf] bg-white px-2.5 py-1.5',
          'text-sm text-stone-700 shadow-[0_12px_40px_rgba(17,17,17,0.08)] outline-none',
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardContent, HoverCardTrigger }
