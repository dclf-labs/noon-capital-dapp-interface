/** Primary CTA copy: `Buy USN`, `Bridge sUSN`, etc. Falls back to the verb alone. */
export function formatActionTokenLabel(action: string, symbol?: string): string {
  const trimmed = symbol?.trim()
  return trimmed ? `${action} ${trimmed}` : action
}
