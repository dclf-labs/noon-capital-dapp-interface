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
}: {
  links: readonly { label: string; href: string }[]
  align?: 'start' | 'end'
}) {
  return (
    <div
      className={cn(
        'flex min-w-[200px] flex-1 flex-wrap items-center gap-3 text-lg leading-7 font-book text-[#a5a5a5]',
        align === 'end' && 'justify-end',
      )}
    >
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="hover:text-stone-700"
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}

export function AppFooter() {
  return (
    <footer className="mt-auto w-full border-t border-[#d4d1cf] bg-[#e9e9e9] p-8">
      <div
        className="mx-auto flex w-full flex-wrap items-center gap-6"
        style={{ maxWidth: APP_SHELL_MAX_PX }}
      >
        <FooterLinks links={FOOTER_LEFT_LINKS} align="end" />

        <div className="flex min-w-[220px] flex-1 flex-col items-center justify-center gap-8">
          <img
            src="/assets/shell/noon-logo.svg"
            alt="NOON"
            width={81}
            height={24}
            className="h-6 w-[81px] opacity-70"
          />
          <p className="text-center text-sm leading-5 font-medium text-[#a5a5a5]">
            © 2026 Noon HoldCo. All rights reserved.
          </p>
          <div className="flex items-center gap-[18px]">
            {FOOTER_SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="size-7 opacity-70 transition-opacity hover:opacity-100"
              >
                <img src={social.iconSrc} alt="" width={28} height={28} className="size-full" />
              </a>
            ))}
          </div>
        </div>

        <FooterLinks links={FOOTER_RIGHT_LINKS} />
      </div>
    </footer>
  )
}
