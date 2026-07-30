import { useMemo } from 'react'

import { addressToBytes32 } from '@layerzerolabs/lz-v2-utilities'
import { type Config, getPublicClient } from '@wagmi/core'
import { type Abi, fromBytes } from 'viem'

import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { getBridgeOptionsForDestination } from '@/features/bridge/lib/bridge'
import useGasFee from '@/hooks/on-chain/evm/useGasFee'
import LayerzeroOft from '@/lib/abis/evm/layerzero-oft.json'
import LayerzeroOftHelper from '@/lib/abis/evm/layerzero-oft-helper.json'
import { type Address } from '@/lib/address'
import { getAddressOrZeroAddress, getLayerZeroReceiverAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'
import { strToBn, toBn } from '@/lib/format'
import { wagmiConfig } from '@/wallet/evm/config'

const useLayerzeroBridgeSubmitFee = (
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

    const receiverBytes32 = fromBytes(
      addressToBytes32(getLayerZeroReceiverAddress(receiverAddress)),
      'hex',
    )
    const bridgeOptions = getBridgeOptionsForDestination(destinationConnection?.config?.id)

    if (
      !tokenIn ||
      !tokenOut ||
      !receiverAddress ||
      !destinationConnection ||
      !read ||
      !read?.chain?.id ||
      !destinationConnection?.config?.id ||
      !destinationConnection?.config?.layerzeroOftEid ||
      (!connection.config?.layerzeroOftHelper && !tokenIn?.layerzeroOftAddress)
    ) {
      return {
        connection,
        address: getAddressOrZeroAddress(
          connection.config?.layerzeroOftHelper || tokenIn?.layerzeroOftAddress,
        ),
        args: connection.config?.layerzeroOftHelper
          ? [
              getAddressOrZeroAddress(tokenIn?.contractAddress),
              [
                toBn(destinationConnection?.config?.layerzeroOftEid).toString(),
                receiverBytes32,
                '1',
                '1',
                bridgeOptions,
                '0x',
                '0x',
              ],
            ]
          : [
              [
                toBn(destinationConnection?.config?.layerzeroOftEid).toString(),
                receiverBytes32,
                '1',
                '1',
                bridgeOptions,
                '0x',
                '0x',
              ],
              ['1', '0'],
              connection.address,
            ],
      }
    }

    const _amountIn = amount
      ? strToBn(amount, tokenIn?.decimals).toString()
      : strToBn(`0.${'0'.repeat(tokenIn?.decimals - 2)}11`, tokenIn?.decimals).toString()
    const _amountOut = amount
      ? strToBn(amount, tokenOut?.decimals).toString()
      : strToBn(`0.${'0'.repeat(tokenOut?.decimals - 2)}10`, tokenOut?.decimals).toString()

    const _decimals =
      connection?.config?.defaultGasToken?.decimals || read?.chain?.nativeCurrency?.decimals
    const _nativeFee = nativeFee
      ? strToBn(nativeFee, _decimals).toString()
      : strToBn(`0.${'0'.repeat(_decimals - 2)}11`, _decimals).toString()

    return {
      connection,
      address: getAddressOrZeroAddress(
        connection.config?.layerzeroOftHelper || tokenIn?.layerzeroOftAddress,
      ),
      args: connection.config?.layerzeroOftHelper
        ? [
            getAddressOrZeroAddress(tokenIn?.contractAddress),
            [
              toBn(destinationConnection?.config?.layerzeroOftEid).toString(),
              receiverBytes32,
              _amountIn,
              _amountOut,
              bridgeOptions,
              '0x',
              '0x',
            ],
          ]
        : [
            [
              toBn(destinationConnection?.config?.layerzeroOftEid).toString(),
              receiverBytes32,
              _amountIn,
              _amountOut,
              bridgeOptions,
              '0x',
              '0x',
            ],
            [_nativeFee, '0'],
            connection.address,
          ],
    }
  }, [amount, connection, destinationConnection, nativeFee, receiverAddress, tokenIn, tokenOut])

  return useGasFee({
    connection: params?.connection,
    address: params?.address,
    abi: connection.config?.layerzeroOftHelper
      ? (LayerzeroOftHelper as Abi)
      : (LayerzeroOft as Abi),
    functionName: 'send',
    args: params?.args,
    configActionKey: 'bridge',
    value: nativeFee,
  })
}

export default useLayerzeroBridgeSubmitFee
