import { useContext } from 'react'

import { SuiWalletSelectorContext } from '@/features/shell/sui-wallet-selector/context'

const useSuiWalletSelector = () => useContext(SuiWalletSelectorContext)

export default useSuiWalletSelector
