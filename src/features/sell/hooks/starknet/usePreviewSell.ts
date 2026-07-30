import { type Token } from '@/config/token'
import { usePreviewEkuboSwap } from '@/features/swap/hooks/usePreviewEkuboSwap'
import { type StarknetConnection } from '@/lib/connection'

const usePreviewSell = (
  connection: StarknetConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amountIn: number | undefined,
) => usePreviewEkuboSwap('sell', connection, tokenIn, tokenOut, amountIn)

export default usePreviewSell
