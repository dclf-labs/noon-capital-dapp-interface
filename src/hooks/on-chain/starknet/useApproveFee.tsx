import { uint256 } from 'starknet'
import { maxUint256 } from 'viem'

import { type Token } from '@/config/token'
import useGasFee from '@/hooks/on-chain/starknet/useGasFee'
import { type StarknetAddress } from '@/lib/address'
import { type StarknetConnection } from '@/lib/connection'

const useApproveGasFee = (
  connection: StarknetConnection,
  token: Token | undefined,
  spender: StarknetAddress | undefined,
) => {
  return useGasFee({
    connection,
    address: token?.contractAddress,
    functionName: 'approve',
    calls: [
      {
        contractAddress: connection?.config?.defaultGasToken?.contractAddress as StarknetAddress,
        entrypoint: 'approve',
        calldata: [
          spender as StarknetAddress,
          uint256.bnToUint256(maxUint256).low,
          uint256.bnToUint256(maxUint256).high,
        ],
      },
    ],
    configActionKey: 'approve',
  })
}

export default useApproveGasFee
