import { createTradeFormHooks } from '@/features/_shared/trade-form-context'
import {
  SellBalanceContext,
  SellFormContext,
  SellPriceContext,
  SellTxnContext,
} from '@/features/sell/context/starknet/context'

const {
  useForm: useSellForm,
  useBalance: useSellBalance,
  usePrice: useSellPrice,
  useTxn: useSellTxn,
  useTrade: useSell,
} = createTradeFormHooks({
  FormContext: SellFormContext,
  BalanceContext: SellBalanceContext,
  PriceContext: SellPriceContext,
  TxnContext: SellTxnContext,
})

export { useSell, useSellBalance, useSellForm, useSellPrice, useSellTxn }
export default useSell
