import type { ProtocolChainId } from '@/config/chain-id'
import { type Token } from '@/config/token'
import { type Address } from '@/lib/address'

export interface FormInputs {
  token: Token | undefined
  amount: number | undefined
  tokens: Token[] | undefined
  sourceChainId: ProtocolChainId | undefined
  destinationChainId: ProtocolChainId | undefined
  receiverAddress: Address | undefined
}

export interface BridgeFormState extends FormInputs {
  isApproved: boolean
  isInsufficientBalance: boolean
}
