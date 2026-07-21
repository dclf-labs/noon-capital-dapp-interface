import type { SVGProps } from 'react'

import { cn } from '@/lib/utils'

export function NoonLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('size-8', className)}
      aria-hidden
      {...props}
    >
      <circle cx="16" cy="16" r="15" className="fill-primary/15 stroke-primary" strokeWidth="1.5" />
      <path
        d="M10 22C10 16.477 14.477 12 20 12V14C15.582 14 12 17.582 12 22H10Z"
        className="fill-primary"
      />
      <circle cx="20" cy="12" r="3" className="fill-primary" />
    </svg>
  )
}
