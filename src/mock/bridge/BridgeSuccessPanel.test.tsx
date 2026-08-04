import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Token } from '@/config/token'
import { BridgeSuccessPanel } from '@/mock/bridge/BridgeSuccessPanel'
import { BRIDGE_SUCCESS_NOTE } from '@/mock/bridge/constants'

const susn: Token = {
  symbol: 'sUSN',
  name: 'sUSN',
  decimals: 18,
  iconSlug: 'susn',
  contractAddress: '0xsusn' as Token['contractAddress'],
}

describe('BridgeSuccessPanel', () => {
  it('renders success copy, note, explorer link, and Bridge more', async () => {
    const user = userEvent.setup()
    const onBridgeMore = vi.fn()
    render(
      <BridgeSuccessPanel
        amount={5}
        token={susn}
        txnUrl="https://etherscan.io/tx/0xdef"
        onBridgeMore={onBridgeMore}
      />,
    )

    expect(screen.getByText(/successfully bridged/i)).toBeInTheDocument()
    expect(document.querySelector('img[src="/assets/buy/check-circle.svg"]')).toBeTruthy()
    expect(screen.getByText(BRIDGE_SUCCESS_NOTE)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view explorer/i })).toHaveAttribute(
      'href',
      'https://etherscan.io/tx/0xdef',
    )
    await user.click(screen.getByRole('button', { name: 'Bridge more' }))
    expect(onBridgeMore).toHaveBeenCalledTimes(1)
  })
})
