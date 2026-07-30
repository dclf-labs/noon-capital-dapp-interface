import type { ChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { type Address } from '@/lib/address'
import { type StarknetAddress } from '@/lib/address'
import { type SuiAddress } from '@/lib/address'

export interface FormInputs {
  token: Token | undefined
  amount: number | undefined
  tokens: Token[] | undefined
  sourceChainId: ChainId | undefined
  destinationChainId: ChainId | undefined
  receiverAddress: Address | undefined | StarknetAddress | SuiAddress // Computed field based on destination network
  evmReceiverAddress: Address | undefined
  starknetReceiverAddress: StarknetAddress | undefined
  suiReceiverAddress: SuiAddress | undefined
}

export interface BridgeFormState extends FormInputs {
  isApproved: boolean
  isInsufficientBalance: boolean
}
