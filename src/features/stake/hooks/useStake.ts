import { createTradeFormHooks } from '@/features/_shared/trade-form-context'
import {
  StakeBalanceContext,
  StakeFormContext,
  StakePriceContext,
  StakeTxnContext,
} from '@/features/stake/context/context'

const {
  useForm: useStakeForm,
  useBalance: useStakeBalance,
  usePrice: useStakePrice,
  useTxn: useStakeTxn,
  useTrade: useStake,
} = createTradeFormHooks({
  FormContext: StakeFormContext,
  BalanceContext: StakeBalanceContext,
  PriceContext: StakePriceContext,
  TxnContext: StakeTxnContext,
})

export { useStake, useStakeBalance, useStakeForm, useStakePrice, useStakeTxn }
export default useStake
