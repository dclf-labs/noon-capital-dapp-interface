import { useMemo } from 'react'

import { type Abi } from 'viem'

import useGasFee from '@/hooks/on-chain/evm/useGasFee'
import sNoon from '@/lib/abis/evm/snoon.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import type { EVMConnection } from '@/lib/connection'
import { toStr } from '@/lib/format'

const useClaimAndStakeFee = (
  connection: EVMConnection,
  amount: string | undefined,
  proof: string[] | undefined,
) => {
  const params = useMemo(() => {
    return {
      connection,
      address: getAddressOrZeroAddress(connection.config?.sNoon),
      args: [toStr(amount), proof],
    }
  }, [amount, connection, proof])

  return useGasFee({
    connection: params?.connection,
    address: params?.address,
    abi: sNoon as Abi,
    functionName: 'claimAndStake',
    args: params?.args,
    configActionKey: 'claimAndStake',
  })
}

export default useClaimAndStakeFee
