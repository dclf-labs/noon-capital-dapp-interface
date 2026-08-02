import { RedeemProvider } from '@/features/redeem'
import { EvmRedeemFlow } from '@/pages/mint-redeem/EvmRedeemFlow'

export function RedeemPage() {
  return (
    <RedeemProvider>
      <EvmRedeemFlow />
    </RedeemProvider>
  )
}
