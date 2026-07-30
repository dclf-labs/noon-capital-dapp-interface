import { createTradeFormHooks } from '@/features/_shared/trade-form-context'
import {
  UnstakeBalanceContext,
  UnstakeFormContext,
  UnstakePriceContext,
  UnstakeTxnContext,
} from '@/features/unstake/context/context'

const {
  useForm: useUnstakeForm,
  useBalance: useUnstakeBalance,
  usePrice: useUnstakePrice,
  useTxn: useUnstakeTxn,
  useTrade: useUnstake,
} = createTradeFormHooks({
  FormContext: UnstakeFormContext,
  BalanceContext: UnstakeBalanceContext,
  PriceContext: UnstakePriceContext,
  TxnContext: UnstakeTxnContext,
})

export { useUnstake, useUnstakeBalance, useUnstakeForm, useUnstakePrice, useUnstakeTxn }
export default useUnstake
