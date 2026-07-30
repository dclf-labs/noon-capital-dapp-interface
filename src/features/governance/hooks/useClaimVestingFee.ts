import { useMemo } from 'react'

import { type Abi } from 'viem'

import useGasFee from '@/hooks/on-chain/evm/useGasFee'
import sNoon from '@/lib/abis/evm/snoon.json'
import { getAddressOrZeroAddress } from '@/lib/address'
import type { EVMConnection } from '@/lib/connection'
import { toStr } from '@/lib/format'

const useClaimVestingFee = (
  connection: EVMConnection,
  tokenId: number | undefined,
  scheduleId: number | undefined,
) => {
  const params = useMemo(() => {
    return {
      connection,
      address: getAddressOrZeroAddress(connection.config?.sNoon),
      args: [toStr(tokenId), toStr(scheduleId)],
    }
  }, [tokenId, scheduleId, connection])

  return useGasFee({
    connection: params?.connection,
    address: params?.address,
    abi: sNoon as Abi,
    functionName: 'claimVesting',
    args: params?.args,
    configActionKey: 'claimVesting',
  })
}

export default useClaimVestingFee
