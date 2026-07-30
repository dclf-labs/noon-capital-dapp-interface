import { useContext } from 'react'

import { ChainFamilySelectorModalContext } from '@/features/shell/chain-family-selector/context'

const useChainFamilySelectorModal = () => useContext(ChainFamilySelectorModalContext)

export default useChainFamilySelectorModal
