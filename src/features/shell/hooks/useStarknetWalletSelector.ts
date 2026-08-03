import { useContext } from 'react'

import { StarknetWalletSelectorContext } from '@/features/shell/starknet-wallet-selector/context'

const useStarknetWalletSelector = () => useContext(StarknetWalletSelectorContext)

export default useStarknetWalletSelector
