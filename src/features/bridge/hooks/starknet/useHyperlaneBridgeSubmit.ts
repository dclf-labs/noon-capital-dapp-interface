import { useMemo } from 'react'

import { useContract, useSendTransaction } from '@starknet-react/core'
import { zeroPadValue } from 'ethers'
import { type Abi, type BigNumberish, CairoOption, CairoOptionVariant, uint256 } from 'starknet'
import { type Address } from 'viem'

import { type Token } from '@/config/token'
import ABI from '@/lib/abis/evm/layerzero-hyperlane-token.json'
import { getAddressOrZeroAddress, isEVMAddressValid } from '@/lib/address'
import { type EVMConnection, type StarknetConnection } from '@/lib/connection'
import { strToBn, toBn } from '@/lib/format'

const useHyperlaneBridgeSubmit = (
  connection: StarknetConnection | undefined,
  tokenIn: Token | undefined,
  _tokenOut: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  nativeFee: number | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const { contract } = useContract({
    abi: ABI as Abi,
    address: tokenIn?.hyperlane as Address,
  })

  const { send, data, isPending, isError, isSuccess } = useSendTransaction({
    calls:
      contract &&
      !!tokenIn?.hyperlane &&
      !!connection?.config?.defaultGasToken?.decimals &&
      !!connection?.config?.hyperlaneMailbox &&
      !!connection?.config?.hyperlaneDomain &&
      isEVMAddressValid(receiverAddress) &&
      !!amount &&
      !!destinationConnection?.config?.hyperlaneDomain
        ? [
            {
              contractAddress: connection?.config?.defaultGasToken?.contractAddress as Address,
              entrypoint: 'approve',
              calldata: [
                tokenIn?.hyperlane as Address,
                uint256.bnToUint256(
                  strToBn(nativeFee, connection?.config?.defaultGasToken?.decimals),
                ).low,
                uint256.bnToUint256(
                  strToBn(nativeFee, connection?.config?.defaultGasToken?.decimals),
                ).high,
              ],
            },
            contract?.populate('transfer_remote', [
              toBn(destinationConnection?.config?.hyperlaneDomain),
              zeroPadValue(getAddressOrZeroAddress(receiverAddress), 32),
              strToBn(amount, tokenIn?.decimals),
              strToBn(nativeFee, connection?.config?.defaultGasToken?.decimals),
              new CairoOption<BigNumberish>(CairoOptionVariant.None),
              new CairoOption<BigNumberish>(CairoOptionVariant.None),
            ]),
          ]
        : undefined,
  })

  return useMemo(
    () => ({
      mutationStatus: {
        isPending,
        isError,
        isSuccess,
      },
      onSubmit: send,
      txnHash: data?.transaction_hash || undefined,
    }),
    [isPending, isError, isSuccess, send, data?.transaction_hash],
  )
}

export default useHyperlaneBridgeSubmit
