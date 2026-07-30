import { createTradeFormHooks } from '@/features/_shared/trade-form-context'
import {
  BuyBalanceContext,
  BuyFormContext,
  BuyPriceContext,
  BuyTxnContext,
} from '@/features/buy/context/starknet/context'

const {
  useForm: useBuyForm,
  useBalance: useBuyBalance,
  usePrice: useBuyPrice,
  useTxn: useBuyTxn,
  useTrade: useBuy,
} = createTradeFormHooks({
  FormContext: BuyFormContext,
  BalanceContext: BuyBalanceContext,
  PriceContext: BuyPriceContext,
  TxnContext: BuyTxnContext,
})

export { useBuy, useBuyBalance, useBuyForm, useBuyPrice, useBuyTxn }
export default useBuy
