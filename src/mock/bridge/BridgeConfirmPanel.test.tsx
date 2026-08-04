import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Token } from '@/config/token'
import { BridgeConfirmPanel } from '@/mock/bridge/BridgeConfirmPanel'

const susn: Token = {
  symbol: 'sUSN',
  name: 'sUSN',
  decimals: 18,
  iconSlug: 'susn',
  contractAddress: '0xsusn' as Token['contractAddress'],
}

describe('BridgeConfirmPanel', () => {
  it('wires back/primary and sanitizes address explorer links', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    const onPrimary = vi.fn()
    render(
      <BridgeConfirmPanel
        amount={10}
        token={susn}
        sourceName="Ethereum"
        destinationName="zkSync"
        sourceAddress="0x1111111111111111111111111111111111111111"
        receiverValue="0x2222222222222222222222222222222222222222"
        sourceAddressExplorerUrl="https://etherscan.io/address"
        destinationAddressExplorerUrl="javascript:alert(1)"
        primaryLabel="Confirm bridge"
        onBack={onBack}
        onPrimary={onPrimary}
      />,
    )

    expect(screen.getByText(/confirm your bridge transaction/i)).toBeInTheDocument()
    expect(screen.getByText('Bridge from')).toBeInTheDocument()
    expect(screen.getByText('Bridge to')).toBeInTheDocument()
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
    expect(screen.getByText('zkSync')).toBeInTheDocument()
    expect(screen.getAllByText('sUSN').length).toBeGreaterThanOrEqual(2)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute(
      'href',
      'https://etherscan.io/address/0x1111111111111111111111111111111111111111',
    )

    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Confirm bridge' }))
    expect(onPrimary).toHaveBeenCalledTimes(1)
  })
})
