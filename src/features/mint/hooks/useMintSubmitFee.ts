import { useMemo } from 'react'

import { type Abi, zeroAddress } from 'viem'

import { type Token } from '@/config/token'
import { getDirectMintCallArgs, stringifyCallArgs } from '@/features/mint-redeem/submit-args'
import useGasFee from '@/hooks/on-chain/evm/useGasFee'
import DirectMinter from '@/lib/abis/evm/direct-minter.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'

const useMintSubmitFee = (
  connection: EVMConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amountIn: number | undefined,
  amountOut: number | undefined,
) => {
  const params = useMemo(() => {
    const args = stringifyCallArgs(getDirectMintCallArgs(tokenIn, tokenOut, amountIn, amountOut), [
      zeroAddress,
      '1',
      '1',
    ])
    return {
      connection,
      address: getAddressOrZeroAddress(connection.config?.directMinter),
      args,
    }
  }, [amountIn, amountOut, connection, tokenIn, tokenOut])

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
