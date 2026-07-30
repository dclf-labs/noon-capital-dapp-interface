import { createTradeFormHooks } from '@/features/_shared/trade-form-context'
import {
  RedeemBalanceContext,
  RedeemFormContext,
  RedeemPriceContext,
  RedeemTxnContext,
} from '@/features/redeem/context/context'

const {
  useForm: useRedeemForm,
  useBalance: useRedeemBalance,
  usePrice: useRedeemPrice,
  useTxn: useRedeemTxn,
  useTrade: useRedeem,
} = createTradeFormHooks({
  FormContext: RedeemFormContext,
  BalanceContext: RedeemBalanceContext,
  PriceContext: RedeemPriceContext,
  TxnContext: RedeemTxnContext,
})

export { useRedeem, useRedeemBalance, useRedeemForm, useRedeemPrice, useRedeemTxn }
export default useRedeem
