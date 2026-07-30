export const DEFAULT_USERNAME = 'fren'
export const DEFAULT_AVATAR = '/assets/avatar.png'

export const PROHIBITED_COUNTRY_ALPHA2 = [
  'US', // USA
  'AF', // Afghanistan
  'BY', // Belarus
  // 'AL', // Albania (Balkans)
  // 'BG', // Bulgaria
  // 'HR', // Croatia
  // 'ME', // Montenegro
  // 'MK', // North Macedonia
  // 'RO', // Romania
  // 'RS', // Serbia
  // 'SI', // Slovenia
  // 'XK', // Kosovo
  'BA', // Bosnia and Herzegovina
  'MM', // Burma/Myanmar
  'BI', // Burundi
  'CF', // Central African Republic
  'CD', // Democratic Republic of Congo
  'CG', // Congo
  'Crimea', // Crimea
  'Donetsk', // Donetsk
  'Luhansk', // Luhansk
  'CU', // Cuba
  'ET', // Ethiopia
  'HT', // Haiti
  'IR', // Iran
  'IQ', // Iraq,
  'LB', // Lebanon,
  'LY', // Libya,
  'ML', // Mali,
  'NI', // Nicaragua,
  'KP', // North Korea
  'GW', // Republic of Guinea-Bissau
  'PK', // Pakistan
  'SO', // Somalia
  'SS', // South Sudan
  'SD', // Sudan & Darfur
  'SY', // Syria
  'UA', // Ukraine
  'VE', // Venezuela
  'YE', // Yemen
  'ZW', // Zimbabwe
  'RU', // Russia
]

export const PROHIBITED_COUNTRY_NUMERIC = [
  '840', // USA
  '004', // Afghanistan
  '112', // Belarus
  // '008', // Albania (Balkans)
  // '100', // Bulgaria
  // '191', // Croatia
  // '499', // Montenegro
  // '807', // North Macedonia
  // '642', // Romania
  // '688', // Serbia
  // '705', // Slovenia
  '070', // Bosnia and Herzegovina
  '104', // Burma/Myanmar
  '108', // Burundi
  '140', // Central African Republic
  '180', // Democratic Republic of Congo
  '178', // Congo
  '192', // Cuba
  '231', // Ethiopia
  '332', // Haiti
  '364', // Iran
  '368', // Iraq,
  '422', // Lebanon,
  '434', // Libya,
  '466', // Mali,
  '558', // Nicaragua,
  '408', // North Korea
  '624', // Republic of Guinea-Bissau
  '586', // Pakistan
  '706', // Somalia
  '728', // South Sudan
  '729', // Sudan & Darfur
  '760', // Syria
  '804', // Ukraine
  '862', // Venezuela
  '887', // Yemen
  '716', // Zimbabwe
  '643', // Russia
]

/* Price of collateral token */
export const DEFAULT_COLLATERAL_PRICE = '1'

/* Interval for refetching data */
export const REFETCH_INTERVAL = 5 * 60 * 1000 // 5 minutes.
export const REFETCH_API_INTERVAL = 20 * 60 * 1000 // 20 minutes.
export const REFETCH_INTERVAL_COLLATERAL_PRICE = 10 * 60 * 1000 // 30 minutes.
export const REFETCH_INTERVAL_GAS_AND_ETH_PRICE = 30 * 60 * 1000 // 30 minutes.
