import { erc20Abi, maxUint256 } from 'viem'

import { type Token } from '@/config/token'
import useGasFee from '@/hooks/on-chain/evm/useGasFee'
import { type EvmAddress } from '@/lib/address'
import { type EVMConnection } from '@/lib/connection'

const useApproveGasFee = (
  connection: EVMConnection,
  token: Token | undefined,
  spender: EvmAddress | undefined,
) => {
  return useGasFee({
    connection,
    address: token?.contractAddress,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender, maxUint256.toString()],
    configActionKey: 'approve',
  })
}

export default useApproveGasFee
