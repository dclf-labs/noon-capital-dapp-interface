import {
  type Abi,
  type Account,
  type Chain,
  type ContractFunctionArgs,
  type WriteContractParameters,
} from 'viem'

import type { Address } from '@/config/address'
import type { ProtocolChainConfig } from '@/config/types'

export const getTxnPayload = (
  _: ProtocolChainConfig,
  chain: Chain,
  account: Account,
  abi: Abi,
  functionName: string,
  address: Address,
  args: ContractFunctionArgs<Abi>,
  value?: bigint,
  gasLimit?: bigint,
) => {
  let _txnPayload: WriteContractParameters = {
    abi,
    functionName,
    chain: chain,
    address,
    args,
    account: account,
  }

  if (value && value > BigInt(0)) {
    _txnPayload = {
      ..._txnPayload,
      value: value || BigInt(0),
    }
  }

  if (gasLimit) {
    _txnPayload.gas = gasLimit
  }

  return _txnPayload
}
