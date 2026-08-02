/**
 * External URLs — mirrored from `noon/landing-page` `SITE_URLS` + marketing routes
 * so footer / chrome links stay consistent with the marketing site.
 */
export const SITE_URLS = {
  marketing: {
    home: 'https://noon.capital',
    privacy: 'https://noon.capital/privacy-policy',
    cookies: 'https://noon.capital/cookie-policy',
    terms: 'https://noon.capital/terms-and-conditions',
  },
  noon: {
    app: 'https://app.noon.capital',
    docs: 'https://docs.noon.capital',
    forum: 'https://forum.noon.capital',
    governance: 'https://app.noon.capital/governance',
  },
  community: {
    accountable: 'https://noon.accountable.capital/',
    snapshot: 'https://snapshot.box/#/s:nooncapital.eth',
    paragraph: 'https://paragraph.com/@nooncapital/',
  },
  social: {
    x: 'https://x.com/noon_capital',
    telegram: 'https://t.me/nooncapital',
    linkedin: 'https://www.linkedin.com/company/nooncapital/',
    github: 'https://github.com/dclf-labs',
    discord: 'https://discord.com/invite/XFeJ94E9NS',
  },
  support: {
    mailto: 'mailto:support@noon.capital',
    email: 'support@noon.capital',
  },
} as const
