import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { mainnet } from 'wagmi/chains'

import { getToken } from '@/config'
import { isValidWithdrawRequestId, type WithdrawRequestView } from '@/features/stake-unstake'
import { useWithdrawPeriod, useWithdrawRequests, useWithdrawSubmit } from '@/features/withdraw'
import { useEvmTargetSession } from '@/hooks/connection/useWalletSession'
import { TxnStatus } from '@/lib/connection'
import { cn } from '@/lib/utils'
import { BRIDGE_PANEL_SHELL, FadeScrollArea, PrimaryCtaButton } from '@/mock/_shared'
import { WithdrawRequestCard } from '@/mock/stake-unstake/WithdrawRequestCard'
import { useConnectWalletFamily } from '@/wallet/useConnectWalletFamily'

const WITHDRAW_SCROLL_HEIGHT_PX = 666
/** Live countdown refresh interval. */
const COUNTDOWN_TICK_MS = 1_000

/**
 * Wall-clock ms that advances on an interval while the document is visible.
 * Pauses in background tabs; snaps to now when visibility returns.
 */
function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const id = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      tick()
    }, intervalMs)

    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [intervalMs])

  return now
}

function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className={cn(BRIDGE_PANEL_SHELL, 'p-4')}>
      <FadeScrollArea
        heightPx={WITHDRAW_SCROLL_HEIGHT_PX}
        aria-label="Withdrawal requests"
        className="rounded-lg"
      >
        <div className="flex flex-col gap-2 pr-1">{children}</div>
      </FadeScrollArea>
    </div>
  )
}

/** Ethereum mainnet sUSN → USN claim list after unstake cooldown. */
export function WithdrawClaimsPanel() {
  const connection = useEvmTargetSession(mainnet.id)
  const token = getToken(connection.config, 'USN')
  const period = useWithdrawPeriod(connection)
  const requests = useWithdrawRequests(connection, token)
  const submit = useWithdrawSubmit()
  const connectWalletFamily = useConnectWalletFamily()
  const nowMs = useNow(COUNTDOWN_TICK_MS)

  const [busyId, setBusyId] = useState<number | undefined>(undefined)
  const [claimStatus, setClaimStatus] = useState<TxnStatus | undefined>(undefined)
  const [failedId, setFailedId] = useState<number | undefined>(undefined)
  const [txnUrls, setTxnUrls] = useState<Record<number, string>>({})

  const openRequests = useMemo((): WithdrawRequestView[] => {
    return requests.data.filter(
      (r: WithdrawRequestView) =>
        isValidWithdrawRequestId(r.requestId) &&
        Number.isFinite(r.amount) &&
        Number.isFinite(r.timestamp) &&
        (!r.claimed || r.amount > 0),
    )
  }, [requests.data])

  const onClaim = useCallback(
    (requestId: number) => {
      if (!isValidWithdrawRequestId(requestId)) return
      if (busyId !== undefined) return

      setBusyId(requestId)
      setClaimStatus(TxnStatus.PROCESSING)
      setFailedId(undefined)

      void submit(
        connection,
        requestId,
        () => {
          void requests.refetch()
          setBusyId(undefined)
          setClaimStatus(undefined)
        },
        (status) => {
          // Submit helpers may emit IDLE at start — ignore so we don't clear loading.
          if (status === TxnStatus.IDLE) return

          setClaimStatus(status)

          if (status === TxnStatus.TXN_FAILURE) {
            setFailedId(requestId)
            setBusyId(undefined)
          }
          if (status === TxnStatus.TXN_SUCCESS) {
            setFailedId(undefined)
            setBusyId(undefined)
            setClaimStatus(undefined)
          }
        },
        (url) => {
          if (typeof url === 'string' && url.length > 0) {
            setTxnUrls((prev) => ({ ...prev, [requestId]: url }))
          }
        },
      )
    },
    [busyId, connection, requests, submit],
  )

  let body: ReactNode

  if (!connection.isConnected) {
    body = (
      <>
        <p className="text-sm leading-5 font-book text-stone-500">
          Connect a wallet to view withdrawal requests.
        </p>
        <PrimaryCtaButton onClick={() => void connectWalletFamily('evm')}>
          Connect wallet
        </PrimaryCtaButton>
      </>
    )
  } else if (connection.unsupported) {
    body = (
      <p className="text-sm leading-5 font-book text-red-600">
        Withdraw is only available on Ethereum mainnet. Switch your wallet to Ethereum.
      </p>
    )
  } else if (requests.isLoading || period.isLoading) {
    body = (
      <p className="animate-pulse text-sm leading-5 font-book text-stone-500">
        Loading withdrawal requests…
      </p>
    )
  } else if (requests.isError) {
    body = (
      <p className="text-sm leading-5 font-book text-red-600">
        Could not load withdrawal requests.
      </p>
    )
  } else if (openRequests.length === 0) {
    body = (
      <p className="text-sm leading-5 font-book text-stone-500">
        No withdrawal requests yet. Unstake sUSN to start a cooldown.
      </p>
    )
  } else {
    const claimInFlight = busyId !== undefined
    body = openRequests.map((request) => (
      <WithdrawRequestCard
        key={request.requestId}
        request={request}
        token={token}
        periodMs={period.data}
        nowMs={nowMs}
        claimStatus={busyId === request.requestId ? claimStatus : undefined}
        failed={failedId === request.requestId}
        claimLocked={claimInFlight && busyId !== request.requestId}
        txnUrl={txnUrls[request.requestId]}
        onClaim={onClaim}
      />
    ))
  }

  return <PanelShell>{body}</PanelShell>
}
