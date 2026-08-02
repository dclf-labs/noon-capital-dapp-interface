/**
 * Cryptographically strong nonces for client-side API / EIP-712 flows.
 * Prefer server-issued challenges when the backend supports them.
 */
export function secureRandomNonce(maxExclusive: number = 100_000_000_000): number {
  if (!Number.isFinite(maxExclusive) || maxExclusive <= 1) {
    throw new Error('maxExclusive must be > 1')
  }

  const max = BigInt(Math.floor(maxExclusive))
  const limit = (1n << 53n) - ((1n << 53n) % max)
  const view = new DataView(new ArrayBuffer(8))

  // Rejection sampling avoids modulo bias for 53-bit values.
  for (;;) {
    crypto.getRandomValues(new Uint8Array(view.buffer))
    // Keep within Number.MAX_SAFE_INTEGER range.
    const candidate = view.getBigUint64(0, false) >> 11n
    if (candidate < limit) {
      return Number(candidate % max)
    }
  }
}
