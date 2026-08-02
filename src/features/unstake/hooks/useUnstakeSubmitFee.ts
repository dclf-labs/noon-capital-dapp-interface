import { useMemo } from 'react'

import type { Abi } from 'viem'

import { type Token } from '@/config/token'
import { getUnstakeWithdrawArgs } from '@/features/stake-unstake/submit-args'
import useGasFee from '@/hooks/on-chain/evm/useGasFee'
import StakingVault from '@/lib/abis/evm/staking-vault.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'

/**
 * Gas estimate for unstake `withdraw`.
 * `assetsAmount` must be the previewed USN out (same as submit).
 */
const useUnstakeSubmitFee = (
  connection: EVMConnection,
  tokenOut: Token | undefined,
  assetsAmount: number | undefined,
) => {
  const params = useMemo(() => {
    const args = getUnstakeWithdrawArgs(
      tokenOut,
      assetsAmount,
      connection.config?.stakeWithdrawHandler,
      connection.address,
    )
    return {
      connection,
      address: getAddressOrZeroAddress(connection.config?.stakingVault),
      args: args
        ? [args[0].toString(), args[1], args[2]]
        : [
            '1',
            getAddressOrZeroAddress(connection.config?.stakeWithdrawHandler),
            getAddressOrZeroAddress(connection.address),
          ],
    }
  }, [assetsAmount, connection, tokenOut])

  return useGasFee({
    connection: params.connection,
    address: params.address,
    abi: StakingVault as Abi,
    functionName: 'withdraw',
    args: params.args,
    configActionKey: 'unstake',
  })
}

export default useUnstakeSubmitFee
