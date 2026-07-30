import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TxnStatus } from '@/lib/connection'
import { submitEvmWrite } from '@/lib/evm-submit'
import { buildEvmConnection, buildReadOnlyConnection } from '@/lib/wallet-session'

const getWalletClient = vi.fn()
const waitForTransactionReceipt = vi.fn()

vi.mock('@wagmi/core', () => ({
  getWalletClient: (...args: unknown[]) => getWalletClient(...args),
}))

vi.mock('viem/actions', () => ({
  waitForTransactionReceipt: (...args: unknown[]) => waitForTransactionReceipt(...args),
}))

vi.mock('@/wallet/evm/config', () => ({
  wagmiConfig: {},
}))

describe('submitEvmWrite', () => {
  beforeEach(() => {
    getWalletClient.mockReset()
    waitForTransactionReceipt.mockReset()
  })

  it('fails closed when the session cannot write', async () => {
    const setTxnStatus = vi.fn()
    const connection = buildReadOnlyConnection({
      chainId: 1,
      address: '0x1111111111111111111111111111111111111111',
    })

    await submitEvmWrite({
      connection,
      buildWriteArgs: async () => {
        throw new Error('should not build')
      },
      callbacks: { setTxnStatus },
    })

    expect(setTxnStatus).toHaveBeenCalledWith(TxnStatus.IDLE)
    expect(setTxnStatus).toHaveBeenCalledWith(TxnStatus.TXN_FAILURE)
    expect(getWalletClient).not.toHaveBeenCalled()
  })

  it('fails closed when wallet chain ≠ target (unsupported)', async () => {
    const setTxnStatus = vi.fn()
    const connection = buildEvmConnection({
      isConnected: true,
      address: '0x1111111111111111111111111111111111111111',
      connector: undefined,
      connectedChainId: 324,
      targetChainId: 1,
    })

    await submitEvmWrite({
      connection,
      buildWriteArgs: async () => {
        throw new Error('should not build')
      },
      callbacks: { setTxnStatus },
    })

    expect(connection.unsupported).toBe(true)
    expect(setTxnStatus).toHaveBeenCalledWith(TxnStatus.TXN_FAILURE)
    expect(getWalletClient).not.toHaveBeenCalled()
  })

  it('fails when the wallet client is missing chain/account', async () => {
    const setTxnStatus = vi.fn()
    getWalletClient.mockResolvedValue({})
    const connection = buildEvmConnection({
      isConnected: true,
      address: '0x1111111111111111111111111111111111111111',
      connector: undefined,
      connectedChainId: 1,
      targetChainId: 1,
    })

    await submitEvmWrite({
      connection,
      buildWriteArgs: async () => {
        throw new Error('should not build')
      },
      callbacks: { setTxnStatus },
    })

    expect(setTxnStatus).toHaveBeenCalledWith(TxnStatus.TXN_FAILURE)
  })

  it('fails when wallet chain ≠ requiredChainId', async () => {
    const setTxnStatus = vi.fn()
    getWalletClient.mockResolvedValue({
      chain: { id: 1, blockExplorers: { default: { url: 'https://etherscan.io' } } },
      account: { address: '0x1111111111111111111111111111111111111111' },
      writeContract: vi.fn(),
    })
    const connection = buildEvmConnection({
      isConnected: true,
      address: '0x1111111111111111111111111111111111111111',
      connector: undefined,
      connectedChainId: 1,
      targetChainId: 1,
    })

    await submitEvmWrite({
      connection,
      requiredChainId: 324,
      buildWriteArgs: async () => ({}) as never,
      callbacks: { setTxnStatus },
    })

    expect(setTxnStatus).toHaveBeenCalledWith(TxnStatus.TXN_FAILURE)
  })

  it('marks success after a successful receipt', async () => {
    const setTxnStatus = vi.fn()
    const setTxnUrl = vi.fn()
    const onSuccess = vi.fn()
    const writeContract = vi.fn().mockResolvedValue('0xabc')
    getWalletClient.mockResolvedValue({
      chain: { id: 1, blockExplorers: { default: { url: 'https://etherscan.io' } } },
      account: { address: '0x1111111111111111111111111111111111111111' },
      writeContract,
    })
    waitForTransactionReceipt.mockResolvedValue({ status: 'success' })

    const connection = buildEvmConnection({
      isConnected: true,
      address: '0x1111111111111111111111111111111111111111',
      connector: undefined,
      connectedChainId: 1,
      targetChainId: 1,
    })

    await submitEvmWrite({
      connection,
      buildWriteArgs: async () => ({ address: '0x1' }) as never,
      callbacks: { setTxnStatus, setTxnUrl, onSuccess },
    })

    expect(writeContract).toHaveBeenCalled()
    expect(setTxnStatus).toHaveBeenCalledWith(TxnStatus.PROCESSING)
    expect(setTxnStatus).toHaveBeenCalledWith(TxnStatus.TXN_SUBMITTED_ON_CHAIN)
    expect(setTxnStatus).toHaveBeenCalledWith(TxnStatus.TXN_SUCCESS)
    expect(setTxnUrl).toHaveBeenCalledWith(expect.stringContaining('/tx/0xabc'))
    expect(onSuccess).toHaveBeenCalled()
  })

  it('marks failure when the receipt reverts', async () => {
    const setTxnStatus = vi.fn()
    getWalletClient.mockResolvedValue({
      chain: { id: 1, blockExplorers: { default: { url: 'https://etherscan.io' } } },
      account: { address: '0x1111111111111111111111111111111111111111' },
      writeContract: vi.fn().mockResolvedValue('0xabc'),
    })
    waitForTransactionReceipt.mockResolvedValue({ status: 'reverted' })

    const connection = buildEvmConnection({
      isConnected: true,
      address: '0x1111111111111111111111111111111111111111',
      connector: undefined,
      connectedChainId: 1,
      targetChainId: 1,
    })

    await submitEvmWrite({
      connection,
      buildWriteArgs: async () => ({}) as never,
      callbacks: { setTxnStatus },
    })

    expect(setTxnStatus).toHaveBeenCalledWith(TxnStatus.TXN_FAILURE)
  })

  it('marks failure when waiting for the receipt times out', async () => {
    const setTxnStatus = vi.fn()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    getWalletClient.mockResolvedValue({
      chain: { id: 1, blockExplorers: { default: { url: 'https://etherscan.io' } } },
      account: { address: '0x1111111111111111111111111111111111111111' },
      writeContract: vi.fn().mockResolvedValue('0xabc'),
    })
    waitForTransactionReceipt.mockRejectedValue(new Error('timeout'))

    const connection = buildEvmConnection({
      isConnected: true,
      address: '0x1111111111111111111111111111111111111111',
      connector: undefined,
      connectedChainId: 1,
      targetChainId: 1,
    })

    await submitEvmWrite({
      connection,
      buildWriteArgs: async () => ({}) as never,
      callbacks: { setTxnStatus },
    })

    expect(setTxnStatus).toHaveBeenCalledWith(TxnStatus.TXN_FAILURE)
    error.mockRestore()
  })

  it('fails when wallet client chain ≠ session config chain', async () => {
    const setTxnStatus = vi.fn()
    getWalletClient.mockResolvedValue({
      chain: { id: 8453, blockExplorers: { default: { url: 'https://basescan.org' } } },
      account: { address: '0x1111111111111111111111111111111111111111' },
      writeContract: vi.fn(),
    })
    const connection = buildEvmConnection({
      isConnected: true,
      address: '0x1111111111111111111111111111111111111111',
      connector: undefined,
      connectedChainId: 1,
      targetChainId: 1,
    })

    await submitEvmWrite({
      connection,
      buildWriteArgs: async () => ({}) as never,
      callbacks: { setTxnStatus },
    })

    expect(setTxnStatus).toHaveBeenCalledWith(TxnStatus.TXN_FAILURE)
  })

  it('marks failure when writeContract throws', async () => {
    const setTxnStatus = vi.fn()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    getWalletClient.mockResolvedValue({
      chain: { id: 1, blockExplorers: { default: { url: 'https://etherscan.io' } } },
      account: { address: '0x1111111111111111111111111111111111111111' },
      writeContract: vi.fn().mockRejectedValue(new Error('user rejected')),
    })
    const connection = buildEvmConnection({
      isConnected: true,
      address: '0x1111111111111111111111111111111111111111',
      connector: undefined,
      connectedChainId: 1,
      targetChainId: 1,
    })

    await submitEvmWrite({
      connection,
      buildWriteArgs: async () => ({}) as never,
      callbacks: { setTxnStatus },
    })

    expect(setTxnStatus).toHaveBeenCalledWith(TxnStatus.PROCESSING)
    expect(setTxnStatus).toHaveBeenCalledWith(TxnStatus.TXN_FAILURE)
    error.mockRestore()
  })
})
