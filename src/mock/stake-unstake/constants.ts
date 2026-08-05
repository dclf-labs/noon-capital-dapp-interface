import type { StatusCalloutType } from '@/mock/bridge/StatusCallout'

/** Neutral callout shown on unstake form + confirm (7-day cooling-off). */
export const UNSTAKE_COOLDOWN_NOTICE = {
  type: 'neutral' as StatusCalloutType,
  title: 'Unstake Request to be withdrawn in 7 days.',
  description:
    'There is a 7-day cooling off period for unstaking sUSN. Your USN will be available to withdraw 7 days after you unstake your sUSN.',
}
