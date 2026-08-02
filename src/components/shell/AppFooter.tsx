import { Link } from 'react-router-dom'

import { NoonLogoIcon } from '@/assets/icons'
import {
  APP_SHELL_MAX_PX,
  FOOTER_LEFT_LINKS,
  FOOTER_RIGHT_LINKS,
  FOOTER_SOCIALS,
} from '@/components/shell/constants'
import { cn } from '@/lib/utils'

function FooterLinks({
  links,
  align = 'start',
  className,
}: {
  links: readonly { label: string; href: string }[]
  align?: 'start' | 'end' | 'center'
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 text-lg leading-7 font-book text-[#a5a5a5]',
        align === 'end' && 'justify-end',
        align === 'center' && 'justify-center',
        className,
      )}
    >
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer noopener"
          className="transition-colors hover:text-primary focus-visible:text-primary"
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}

function FooterBrandBlock() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 md:gap-8">
      <Link
        to="/"
        aria-label="Go to home page"
        className="text-[#808080] transition-colors hover:text-primary focus-visible:text-primary"
      >
        <NoonLogoIcon width={81} height={24} className="h-6 w-[81px]" aria-hidden />
      </Link>
      <p className="text-center text-sm leading-5 font-medium text-[#a5a5a5]">
        © 2026 Noon HoldCo. All rights reserved.
      </p>
      <div className="flex items-center gap-[18px]">
        {FOOTER_SOCIALS.map((social) => {
          const Icon = social.icon
          return (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={social.label}
              className="size-7 text-[#808080] transition-colors hover:text-primary focus-visible:text-primary"
            >
              <Icon width={28} height={28} className="size-full" aria-hidden />
            </a>
          )
        })}
      </div>
    </div>
  )
}

export function AppFooter() {
  return (
    <footer className="mt-auto w-full border-t border-[#d4d1cf] bg-[#e9e9e9] px-4 py-6 md:p-8">
      {/* Mobile stacked footer */}
      <div className="mx-auto flex w-full flex-col items-center gap-8 md:hidden">
        <FooterLinks links={FOOTER_LEFT_LINKS} align="center" />
        <FooterBrandBlock />
        <FooterLinks links={FOOTER_RIGHT_LINKS} align="center" />
      </div>

      {/* Desktop three-column footer */}
      <div
        className="mx-auto hidden w-full flex-wrap items-center gap-6 md:flex"
        style={{ maxWidth: APP_SHELL_MAX_PX }}
      >
        <FooterLinks links={FOOTER_LEFT_LINKS} align="end" className="min-w-[200px] flex-1" />
        <div className="flex min-w-[220px] flex-1 flex-col items-center justify-center">
          <FooterBrandBlock />
        </div>
        <FooterLinks links={FOOTER_RIGHT_LINKS} className="min-w-[200px] flex-1" />
      </div>
    </footer>
  )
}
