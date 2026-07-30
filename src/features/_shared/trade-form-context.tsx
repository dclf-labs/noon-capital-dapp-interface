import { type Context, createContext, useContext, useMemo } from 'react'

/**
 * Standard Form / Balance / Price / Txn context bundle used by trade flows
 * (mint, redeem, stake, buy, sell, bridge, …).
 */
export type TradeFormContexts<TForm, TBalance, TPrice, TTxn> = {
  FormContext: Context<TForm>
  BalanceContext: Context<TBalance>
  PriceContext: Context<TPrice>
  TxnContext: Context<TTxn>
}

export function createTradeFormContexts<TForm, TBalance, TPrice, TTxn>(): TradeFormContexts<
  TForm,
  TBalance,
  TPrice,
  TTxn
> {
  return {
    FormContext: createContext<TForm>(null!),
    BalanceContext: createContext<TBalance>(null!),
    PriceContext: createContext<TPrice>(null!),
    TxnContext: createContext<TTxn>(null!),
  }
}

export function createTradeFormHooks<TForm, TBalance, TPrice, TTxn>(
  contexts: TradeFormContexts<TForm, TBalance, TPrice, TTxn>,
) {
  const useForm = () => useContext(contexts.FormContext)
  const useBalance = () => useContext(contexts.BalanceContext)
  const usePrice = () => useContext(contexts.PriceContext)
  const useTxn = () => useContext(contexts.TxnContext)

  const useTrade = () => {
    const form = useForm()
    const balance = useBalance()
    const price = usePrice()
    const txn = useTxn()

    return useMemo(
      () => ({
        ...form,
        ...balance,
        ...price,
        ...txn,
      }),
      [form, balance, price, txn],
    )
  }

  return { useForm, useBalance, usePrice, useTxn, useTrade }
}
