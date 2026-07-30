/**
 * Central TanStack Query key factory.
 * Keep keys hierarchical: domain → action → discriminating params.
 */
export const queryKeys = {
  protocol: {
    stats: () => ['protocol', 'stats'] as const,
    tvl: () => ['protocol', 'tvl'] as const,
    tvlBreakdown: () => ['protocol', 'tvl', 'breakdown'] as const,
  },

  points: {
    user: (address?: string) => ['points', 'user', address] as const,
    distribution: () => ['points', 'distribution'] as const,
    apyEstimate: (address?: string, usd?: number) =>
      ['points', 'apyEstimate', address, usd] as const,
    totalAtTge: () => ['points', 'totalAtTge'] as const,
    forSeason: (season: string | number, address?: string) =>
      ['points', 'season', season, address] as const,
    forPastSeasons: (address?: string) => ['points', 'pastSeasons', address] as const,
    dollarEstimate: (address?: string) => ['points', 'dollarEstimate', address] as const,
  },

  user: {
    profile: (address?: string) => ['user', 'profile', address] as const,
    username: (address?: string) => ['user', 'username', address] as const,
    linkedWallet: (address?: string) => ['user', 'linkedWallet', address] as const,
    portfolio: (address?: string) => ['user', 'portfolio', address] as const,
    vestingSchedule: (address?: string) => ['user', 'vestingSchedule', address] as const,
    recentTransactions: (address?: string) => ['user', 'recentTransactions', address] as const,
    restrictedCountry: (location?: string) => ['user', 'restrictedCountry', location] as const,
  },

  quests: {
    catalog: () => ['quests', 'catalog'] as const,
    user: (address?: string) => ['quests', 'user', address] as const,
  },

  referral: {
    code: (address?: string) => ['referral', 'code', address] as const,
    campaignLeaderboard: (campaignId?: string | number, startDate?: string, endDate?: string) =>
      ['referral', 'campaign', 'leaderboard', campaignId, startDate, endDate] as const,
    depositorLeaderboard: (campaignId?: string | number, startDate?: string, endDate?: string) =>
      ['referral', 'depositor', 'leaderboard', campaignId, startDate, endDate] as const,
    referrals: (address?: string, campaignId?: string | number) =>
      ['referral', 'campaign', 'referrals', address, campaignId] as const,
    relativeLeaderboard: (address?: string) =>
      ['referral', 'relativeLeaderboard', address] as const,
  },

  governance: {
    user: (address?: string) => ['governance', 'user', address] as const,
    openStakes: (...parts: unknown[]) => ['governance', 'openStakes', ...parts] as const,
  },

  price: {
    gecko: (symbol?: string) => ['price', 'gecko', symbol ?? 'Token'] as const,
    collateral: (symbol?: string) => ['price', 'collateral', symbol ?? 'Token'] as const,
    susn: () => ['price', 'susn'] as const,
    ethAndGas: () => ['price', 'ethAndGas'] as const,
  },

  yieldApp: {
    tvl: () => ['yieldApp', 'tvl'] as const,
    ethTbtcTvl: () => ['yieldApp', 'tvl', 'eth', 'tbtc'] as const,
    citreaWbtcTvl: () => ['yieldApp', 'tvl', 'citrea', 'wcbtc'] as const,
  },

  vesu: {
    tvl: () => ['vesu', 'tvl'] as const,
    userPosition: (address?: string, vault?: string) =>
      ['vesu', 'userPosition', address, vault] as const,
  },

  vault: {
    lagoonApy: () => ['vault', 'lagoon', 'apy'] as const,
    tvl: (...parts: unknown[]) => ['vault', 'tvl', ...parts] as const,
    position: (...parts: unknown[]) => ['vault', 'position', ...parts] as const,
    shareToAsset: (...parts: unknown[]) => ['vault', 'shareToAsset', ...parts] as const,
  },

  mint: {
    preview: (...parts: unknown[]) => ['mint', 'preview', ...parts] as const,
    whitelisted: (...parts: unknown[]) => ['mint', 'whitelisted', ...parts] as const,
  },

  redeem: {
    preview: (...parts: unknown[]) => ['redeem', 'preview', ...parts] as const,
    whitelisted: (...parts: unknown[]) => ['redeem', 'whitelisted', ...parts] as const,
  },

  stake: {
    preview: (...parts: unknown[]) => ['stake', 'preview', ...parts] as const,
  },

  unstake: {
    preview: (...parts: unknown[]) => ['unstake', 'preview', ...parts] as const,
  },

  buy: {
    preview: (...parts: unknown[]) => ['buy', 'preview', ...parts] as const,
  },

  sell: {
    preview: (...parts: unknown[]) => ['sell', 'preview', ...parts] as const,
  },

  bridge: {
    feeQuote: (
      protocol: 'layerzero' | 'hyperlane',
      family: 'evm' | 'starknet' | 'sui',
      ...parts: unknown[]
    ) => ['bridge', 'feeQuote', protocol, family, ...parts] as const,
  },

  token: {
    balance: (family: 'evm' | 'starknet' | 'sui', ...parts: unknown[]) =>
      ['token', 'balance', family, ...parts] as const,
    balanceConnected: (family: 'sui', ...parts: unknown[]) =>
      ['token', 'balance', family, 'connected', ...parts] as const,
    allowance: (family: 'evm' | 'starknet', ...parts: unknown[]) =>
      ['token', 'allowance', family, ...parts] as const,
  },

  gas: {
    fee: (...parts: unknown[]) => ['gas', 'fee', ...parts] as const,
  },

  withdraw: {
    period: (...parts: unknown[]) => ['withdraw', 'period', ...parts] as const,
    requests: (...parts: unknown[]) => ['withdraw', 'requests', ...parts] as const,
  },
} as const
