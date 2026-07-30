import { useMemo } from 'react'

import { type Abi } from 'viem'

import { type Token } from '@/config/token'
import useGasFee from '@/hooks/on-chain/evm/useGasFee'
import DirectMinter from '@/lib/abis/evm/direct-minter.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { strToBn } from '@/lib/format'

const useMintSubmitFee = (
  connection: EVMConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amountIn: number | undefined,
  amountOut: number | undefined,
) => {
  const params = useMemo(() => {
    const parsedAmount = strToBn(amountIn, tokenIn?.decimals)?.toString() || '1'
    const parsedAmountOut = strToBn(amountOut, tokenOut?.decimals)?.toString() || '1'
    return {
      connection,
      address: getAddressOrZeroAddress(connection.config?.directMinter),
      args: [getAddressOrZeroAddress(tokenIn?.contractAddress), parsedAmount, parsedAmountOut],
    }
  }, [
    amountIn,
    amountOut,
    connection,
    tokenIn?.contractAddress,
    tokenIn?.decimals,
    tokenOut?.decimals,
  ])

  return useGasFee({
    connection: params?.connection,
    address: params?.address,
    abi: DirectMinter as Abi,
    functionName: 'directMint',
    args: params?.args,
    configActionKey: 'mint',
  })
}

export default useMintSubmitFee
