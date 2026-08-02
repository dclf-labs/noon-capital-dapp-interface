import { useMemo } from 'react'

import { type Abi, zeroAddress } from 'viem'

import { type Token } from '@/config/token'
import { getDirectRedeemCallArgs, stringifyCallArgs } from '@/features/mint-redeem/submit-args'
import useGasFee from '@/hooks/on-chain/evm/useGasFee'
import DirectRedeemer from '@/lib/abis/evm/direct-redeemer.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'

const useRedeemSubmitFee = (
  connection: EVMConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amountIn: number | undefined,
  amountOut: number | undefined,
) => {
  const params = useMemo(() => {
    const args = stringifyCallArgs(
      getDirectRedeemCallArgs(tokenIn, tokenOut, amountIn, amountOut),
      [zeroAddress, '1', '1'],
    )
    return {
      connection,
      address: getAddressOrZeroAddress(connection.config?.directRedeemer),
      args,
    }
  }, [amountIn, amountOut, connection, tokenIn, tokenOut])

  return useGasFee({
    connection: params.connection,
    address: params.address,
    abi: DirectRedeemer as Abi,
    functionName: 'directRedeem',
    args: params.args,
    configActionKey: 'redeem',
  })
}

export default useRedeemSubmitFee
