import { useMemo } from 'react'

import { type Config, getPublicClient } from '@wagmi/core'
import { zeroPadValue } from 'ethers'
import { type Abi } from 'viem'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { STARKNET_BRIDGE_DESTINATION } from '@/constants/common'
import useGasFee from '@/hooks/on-chain/evm/useGasFee'
import LayerzeroAndHyperlaneToken from '@/lib/abis/evm/layerzero-hyperlane-token.json'
import { type Address } from '@/lib/address'
import { getAddressOrZeroAddress, isAddressValid } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { strToBn, toBn } from '@/lib/format'
import { wagmiConfig } from '@/wallet/evm/config'

const useHyperlaneBridgeSubmitFee = (
  connection: EVMConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amount: number | undefined,
  receiverAddress: Address | undefined,
  nativeFee: number | undefined,
  destinationConnection: EVMConnection | undefined,
) => {
  const params = useMemo(() => {
    const read = getPublicClient(wagmiConfig as Config, {
      chainId: connection.config?.id as ProtocolChainId,
    })

    if (
      !tokenIn ||
      !tokenOut ||
      !receiverAddress ||
      !destinationConnection ||
      !read ||
      !read?.chain?.id ||
      !connection.config?.hyperlaneMailbox ||
      !connection.config?.hyperlaneDomain ||
      !connection.config?.id ||
      !destinationConnection?.config?.id ||
      !destinationConnection?.config?.hyperlaneDomain ||
      !isAddressValid(tokenIn?.hyperlane)
    ) {
      return {
        connection,
        address: getAddressOrZeroAddress(tokenIn?.hyperlane),
        args: [
          '1',
          destinationConnection?.config?.id === STARKNET_BRIDGE_DESTINATION?.id
            ? receiverAddress
            : zeroPadValue(getAddressOrZeroAddress(receiverAddress), 32),
          '1',
        ],
      }
    }

    const _amountIn = amount
      ? strToBn(amount, tokenIn?.decimals).toString()
      : strToBn(`0.${'0'.repeat(tokenIn?.decimals - 2)}11`, tokenIn?.decimals).toString()

    return {
      connection,
      address: getAddressOrZeroAddress(tokenIn?.hyperlane),
      args: [
        toBn(destinationConnection?.config?.hyperlaneDomain).toString(),
        destinationConnection?.config?.id === STARKNET_BRIDGE_DESTINATION?.id
          ? receiverAddress
          : zeroPadValue(getAddressOrZeroAddress(receiverAddress), 32),
        _amountIn,
      ],
    }
  }, [amount, connection, destinationConnection, receiverAddress, tokenIn, tokenOut])

  return useGasFee({
    connection: params?.connection,
    address: params?.address,
    abi: LayerzeroAndHyperlaneToken as Abi,
    functionName: 'sendTokensViaHyperlane',
    args: params?.args,
    configActionKey: 'bridge',
    value: nativeFee,
  })
}

export default useHyperlaneBridgeSubmitFee
