import * as PopoverPrimitive from '@radix-ui/react-popover'
import type { ComponentProps } from 'react'

import { TIP_COLLISION_PADDING_PX, TIP_Z_INDEX } from '@/components/shell/constants'
import { cn } from '@/lib/utils'

function Popover({ ...props }: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({ ...props }: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverAnchor({ ...props }: ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 6,
  collisionPadding = TIP_COLLISION_PADDING_PX,
  style,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
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
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }
