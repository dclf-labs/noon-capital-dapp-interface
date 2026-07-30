import { useMemo } from 'react'

import { type Abi } from 'viem'

import useGasFee from '@/hooks/on-chain/evm/useGasFee'
import sNoon from '@/lib/abis/evm/snoon.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import type { EVMConnection } from '@/lib/connection'
import { toStr } from '@/lib/format'

const useGovernanceStakeFee = (
  connection: EVMConnection,
  amount: string | undefined,
  duration: number | undefined,
) => {
  const params = useMemo(() => {
    return {
      connection,
      address: getAddressOrZeroAddress(connection.config?.sNoon),
      args: [toStr(amount), toStr(duration)],
    }
  }, [amount, connection, duration])

  return useGasFee({
    connection: params?.connection,
    address: params?.address,
    abi: sNoon as Abi,
    functionName: 'createStake',
    args: params?.args,
    configActionKey: 'createStake',
  })
}

export default useGovernanceStakeFee
