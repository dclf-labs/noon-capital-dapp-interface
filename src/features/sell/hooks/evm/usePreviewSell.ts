import { type Token } from '@/config/token'
import { usePreviewSwap } from '@/features/swap/hooks/usePreviewSwap'
import { type EVMConnection } from '@/lib/connection'

const usePreviewSell = (
  connection: EVMConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amountIn: number | undefined,
) => usePreviewSwap('sell', connection, tokenIn, tokenOut, amountIn)

export default usePreviewSell
