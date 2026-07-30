import { useMemo } from 'react'

import { zeroPadValue } from 'ethers'
import { type BigNumberish, CairoOption, CairoOptionVariant, uint256 } from 'starknet'
import { type Address } from 'viem'

import { type Token } from '@/config/token'
import useGasFee from '@/hooks/on-chain/starknet/useGasFee'
import { getAddressOrZeroAddress, isStarknetAddressValid } from '@/lib/address'
import { type EVMConnection, type StarknetConnection } from '@/lib/connection'
import { strToBn, toBn } from '@/lib/format'

const useHyperlaneBridgeSubmitFee = (
  connection: StarknetConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  nativeFee: number | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const params = useMemo(() => {
    if (
      !tokenIn ||
      !tokenOut ||
      !receiverAddress ||
      !destinationConnection ||
      !connection.config?.hyperlaneMailbox ||
      !connection.config?.hyperlaneDomain ||
      !connection.config?.id ||
      !destinationConnection?.config?.id ||
      !destinationConnection?.config?.hyperlaneDomain ||
      !isStarknetAddressValid(tokenIn?.hyperlane)
    ) {
      return {
        connection,
        address: tokenIn?.hyperlane as Address,
        functionName: 'transfer',
        calls: [
          {
            contractAddress: connection?.config?.defaultGasToken?.contractAddress as Address,
            entrypoint: 'approve',
            calldata: [
              tokenIn?.hyperlane as Address,
              uint256.bnToUint256(strToBn(nativeFee, connection?.config?.defaultGasToken?.decimals))
                .low,
              uint256.bnToUint256(strToBn(nativeFee, connection?.config?.defaultGasToken?.decimals))
                .high,
            ],
          },
          {
            contractAddress: tokenIn?.hyperlane as Address,
            entrypoint: 'transfer_remote',
            calldata: [
              toBn(destinationConnection?.config?.hyperlaneDomain)?.toString(),
              uint256.bnToUint256(zeroPadValue(getAddressOrZeroAddress(receiverAddress), 32)),
              uint256.bnToUint256(strToBn(0.000001, tokenIn?.decimals)),
              uint256.bnToUint256(
                strToBn(nativeFee, connection?.config?.defaultGasToken?.decimals),
              ),
              new CairoOption<BigNumberish>(CairoOptionVariant.None),
              new CairoOption<BigNumberish>(CairoOptionVariant.None),
            ],
          },
        ],
      }
    }

    const _amountIn = amount
      ? strToBn(amount, tokenIn?.decimals)
      : strToBn(`0.${'0'.repeat(tokenIn?.decimals - 2)}11`, tokenIn?.decimals)

    return {
      connection,
      address: tokenIn?.hyperlane as Address,
      functionName: 'transfer',
      calls: [
        {
          contractAddress: connection?.config?.defaultGasToken?.contractAddress as Address,
          entrypoint: 'approve',
          calldata: [
            tokenIn?.hyperlane as Address,
            uint256.bnToUint256(strToBn(nativeFee, connection?.config?.defaultGasToken?.decimals))
              .low,
            uint256.bnToUint256(strToBn(nativeFee, connection?.config?.defaultGasToken?.decimals))
              .high,
          ],
        },
        {
          contractAddress: tokenIn?.hyperlane as Address,
          entrypoint: 'transfer_remote',
          calldata: [
            toBn(destinationConnection?.config?.hyperlaneDomain)?.toString(),
            uint256.bnToUint256(zeroPadValue(getAddressOrZeroAddress(receiverAddress), 32)),
            uint256.bnToUint256(_amountIn),
            uint256.bnToUint256(strToBn(nativeFee, connection?.config?.defaultGasToken?.decimals)),
            new CairoOption<BigNumberish>(CairoOptionVariant.None),
            new CairoOption<BigNumberish>(CairoOptionVariant.None),
          ],
        },
      ],
    }
  }, [amount, connection, destinationConnection, nativeFee, receiverAddress, tokenIn, tokenOut])

  return useGasFee({
    connection: params?.connection,
    address: params?.address,
    functionName: params?.functionName,
    calls: params?.calls,
    configActionKey: 'bridge',
  })
}

export default useHyperlaneBridgeSubmitFee
