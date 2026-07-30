import { useMemo } from 'react'

import type { Abi } from 'viem'

import { type Token } from '@/config/token'
import useGasFee from '@/hooks/on-chain/evm/useGasFee'
import StakingVault from '@/lib/abis/evm/staking-vault.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { strToBn } from '@/lib/format'

const useUnstakeSubmitFee = (
  connection: EVMConnection,
  tokenIn: Token | undefined,
  amountIn: number | undefined,
) => {
  const params = useMemo(() => {
    const parsedAmount = strToBn(amountIn, tokenIn?.decimals)
    return {
      connection,
      address: getAddressOrZeroAddress(connection.config?.stakingVault),
      args: [
        parsedAmount?.toString(),
        getAddressOrZeroAddress(connection.config?.stakeWithdrawHandler),
        getAddressOrZeroAddress(connection.address),
      ],
    }
  }, [amountIn, connection, tokenIn])

  return useGasFee({
    connection: params?.connection,
    address: params?.address,
    abi: StakingVault as Abi,
    functionName: 'withdraw',
    args: params?.args,
    configActionKey: 'unstake',
  })
}

export default useUnstakeSubmitFee
