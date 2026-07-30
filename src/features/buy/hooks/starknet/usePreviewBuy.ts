import { type Token } from '@/config/token'
import { usePreviewEkuboSwap } from '@/features/swap/hooks/usePreviewEkuboSwap'
import { type StarknetConnection } from '@/lib/connection'

const usePreviewBuy = (
  connection: StarknetConnection,
  tokenIn: Token | undefined,
  tokenOut: Token | undefined,
  amountIn: number | undefined,
) => usePreviewEkuboSwap('buy', connection, tokenIn, tokenOut, amountIn)

export default usePreviewBuy
