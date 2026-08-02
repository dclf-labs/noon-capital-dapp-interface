import { useMemo } from 'react'

import { type Abi } from 'viem'

import { type Token } from '@/config/token'
import { getStakeDepositArgs } from '@/features/stake-unstake/submit-args'
import useGasFee from '@/hooks/on-chain/evm/useGasFee'
import StakingVault from '@/lib/abis/evm/staking-vault.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'

const useStakeSubmitFee = (
  connection: EVMConnection,
  tokenIn: Token | undefined,
  amountIn: number | undefined,
) => {
  const params = useMemo(() => {
    const args = getStakeDepositArgs(tokenIn, amountIn, connection.address)
    return {
      connection,
      address: getAddressOrZeroAddress(connection.config?.stakingVault),
      args: args
        ? [args[0].toString(), args[1]]
        : ['1', getAddressOrZeroAddress(connection.address)],
    }
  }, [amountIn, connection, tokenIn])

  return useGasFee({
    connection: params.connection,
    address: params.address,
    abi: StakingVault as Abi,
    functionName: 'deposit',
    args: params.args,
    configActionKey: 'stake',
  })
}

export default useStakeSubmitFee
