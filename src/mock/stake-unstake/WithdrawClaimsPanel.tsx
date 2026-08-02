import { useCallback, useMemo, useState } from 'react'

import { mainnet } from 'wagmi/chains'

import { getToken } from '@/config'
import {
  formatCooldownRemaining,
  getWithdrawClaimLabel,
  getWithdrawUnlockAt,
  isWithdrawRequestClaimable,
  type WithdrawRequestView,
} from '@/features/stake-unstake'
import { useWithdrawPeriod, useWithdrawRequests, useWithdrawSubmit } from '@/features/withdraw'
import { useEvmTargetSession } from '@/hooks/connection/useWalletSession'
import { TxnStatus } from '@/lib/connection'
import { down } from '@/lib/format'
import * as styles from '@/mock/stake-unstake/stake-unstake-styles'

function RequestRow({
  request,
  periodMs,
  isBusy,
  failed,
  onClaim,
}: {
  request: WithdrawRequestView
  periodMs: number
  isBusy: boolean
  failed: boolean
  onClaim: () => void
}) {
  const claimable = isWithdrawRequestClaimable(request, periodMs)
  const unlockAt = getWithdrawUnlockAt(request.timestamp, periodMs)
  const label = getWithdrawClaimLabel({
    claimed: request.claimed,
    claimable,
    isBusy,
    failed,
  })
  const disabled = request.claimed || !claimable || isBusy

  return (
    <div style={styles.field}>
      <div style={styles.row}>
        <strong>Request #{request.requestId}</strong>
        <span style={styles.muted}>{down(request.amount, 6)} USN</span>
      </div>
      <p style={styles.muted}>
        {request.claimed
          ? 'Already claimed'
          : claimable
            ? 'Ready to claim'
            : `Cooldown ${formatCooldownRemaining(unlockAt)}`}
      </p>
      <button
        type="button"
        style={disabled ? styles.buttonDisabled : styles.button}
        disabled={disabled}
        onClick={onClaim}
      >
        {label}
      </button>
    </div>
  )
}

export function WithdrawClaimsPanel() {
  const connection = useEvmTargetSession(mainnet.id)
  const token = getToken(connection.config, 'USN')
  const period = useWithdrawPeriod(connection)
  const requests = useWithdrawRequests(connection, token)
  const submit = useWithdrawSubmit()

  const [busyId, setBusyId] = useState<number | undefined>(undefined)
  const [failedId, setFailedId] = useState<number | undefined>(undefined)
  const [txnUrl, setTxnUrl] = useState<string | undefined>(undefined)

  const openRequests = useMemo(
    () => requests.data.filter((r) => !r.claimed || r.amount > 0),
    [requests.data],
  )

  const onClaim = useCallback(
    (requestId: number) => {
      setBusyId(requestId)
      setFailedId(undefined)
      void submit(
        connection,
        requestId,
        () => {
          void requests.refetch()
          setBusyId(undefined)
        },
        (status) => {
          if (status === TxnStatus.TXN_FAILURE) {
            setFailedId(requestId)
            setBusyId(undefined)
          }
          if (status === TxnStatus.TXN_SUCCESS || status === TxnStatus.IDLE) {
            setBusyId(undefined)
          }
        },
        setTxnUrl,
      )
    },
    [connection, requests, submit],
  )

  if (!connection.isConnected) {
    return <p style={styles.muted}>Connect a wallet on Home to view withdrawal requests.</p>
  }

  if (connection.unsupported) {
    return (
      <p style={styles.errorText}>
        Withdraw is only available on Ethereum mainnet. Switch your wallet to Ethereum.
      </p>
    )
  }

  if (requests.isLoading || period.isLoading) {
    return <p style={styles.muted}>Loading withdrawal requests…</p>
  }

  if (requests.isError) {
    return <p style={styles.errorText}>Could not load withdrawal requests.</p>
  }

  if (openRequests.length === 0) {
    return (
      <section style={{ display: 'grid', gap: 12 }}>
        <p style={styles.muted}>No withdrawal requests yet. Unstake sUSN to start a cooldown.</p>
      </section>
    )
  }

  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <p style={styles.banner}>
        Cooling-off period is about {Math.round((period.data || 0) / 86_400_000) || 7} days
        (on-chain). Claim when ready.
      </p>
      {openRequests.map((request) => (
        <RequestRow
          key={request.requestId}
          request={request}
          periodMs={period.data}
          isBusy={busyId === request.requestId}
          failed={failedId === request.requestId}
          onClaim={() => onClaim(request.requestId)}
        />
      ))}
      {txnUrl ? (
        <a href={txnUrl} target="_blank" rel="noreferrer noopener" style={styles.link}>
          View last claim on explorer
        </a>
      ) : null}
    </section>
  )
}
