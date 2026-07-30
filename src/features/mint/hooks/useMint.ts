import { createTradeFormHooks } from '@/features/_shared/trade-form-context'
import {
  MintBalanceContext,
  MintFormContext,
  MintPriceContext,
  MintTxnContext,
} from '@/features/mint/context/context'

const {
  useForm: useMintForm,
  useBalance: useMintBalance,
  usePrice: useMintPrice,
  useTxn: useMintTxn,
  useTrade: useMint,
} = createTradeFormHooks({
  FormContext: MintFormContext,
  BalanceContext: MintBalanceContext,
  PriceContext: MintPriceContext,
  TxnContext: MintTxnContext,
})

export { useMint, useMintBalance, useMintForm, useMintPrice, useMintTxn }
export default useMint
