import { useContext } from 'react'

import { NetworkSelectorDialogContext } from '@/features/shell/network-selector/context'

const useNetworkSelectorDialog = () => useContext(NetworkSelectorDialogContext)

export default useNetworkSelectorDialog
