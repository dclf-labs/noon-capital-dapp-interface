import type { Dispatch, SetStateAction } from 'react'

import type { Token } from '@/config/token'

type BridgeTokenInputs = {
  token?: Token
  tokens?: Token[]
}

function sameTokenList(left: Token[] | undefined, right: Token[] | undefined): boolean {
  if (left === right) return true
  if (!left || !right || left.length !== right.length) return false
  return left.every(
    (token, index) =>
      token.symbol === right[index]?.symbol &&
      token.contractAddress === right[index]?.contractAddress,
  )
}

/**
 * Update bridge token options in place: prefer keeping the current symbol when
 * it still exists on the new route, and avoid no-op state writes that re-render
 * the whole card.
 */
export function applyBridgeTokenSync<TInputs extends BridgeTokenInputs>(
  setInputs: Dispatch<SetStateAction<TInputs>>,
  tokens: Token[] | undefined,
): void {
  setInputs((prev) => {
    const kept =
      prev.token && tokens
        ? tokens.find((token) => token.symbol.toUpperCase() === prev.token!.symbol.toUpperCase())
        : undefined
    const nextToken = kept ?? tokens?.at(0)

    if (
      sameTokenList(prev.tokens, tokens) &&
      prev.token?.symbol === nextToken?.symbol &&
      prev.token?.contractAddress === nextToken?.contractAddress
    ) {
      return prev
    }

    return {
      ...prev,
      tokens,
      token: nextToken,
    }
  })
}
