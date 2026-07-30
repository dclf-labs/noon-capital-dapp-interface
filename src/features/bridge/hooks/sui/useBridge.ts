import { createTradeFormHooks } from '@/features/_shared/trade-form-context'
import {
  BridgeBalanceContext,
  BridgeFormContext,
  BridgePriceContext,
  BridgeTxnContext,
} from '@/features/bridge/context/sui/context'

const {
  useForm: useBridgeForm,
  useBalance: useBridgeBalance,
  usePrice: useBridgePrice,
  useTxn: useBridgeTxn,
  useTrade: useBridge,
} = createTradeFormHooks({
  FormContext: BridgeFormContext,
  BalanceContext: BridgeBalanceContext,
  PriceContext: BridgePriceContext,
  TxnContext: BridgeTxnContext,
})

export { useBridge, useBridgeBalance, useBridgeForm, useBridgePrice, useBridgeTxn }
export default useBridge
