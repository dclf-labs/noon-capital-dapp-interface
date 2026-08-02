import { type Token } from '@/config/token'
import { createAlwaysApprovedAllowance } from '@/features/_shared/always-approved-allowance'
import { type StarknetConnection } from '@/lib/connection'

/**
 * Starknet sell uses transfer-to-router — no approve step.
 */
const useSellAllowance = (_connection: StarknetConnection, token: Token | undefined) =>
  createAlwaysApprovedAllowance(token)

export default useSellAllowance
