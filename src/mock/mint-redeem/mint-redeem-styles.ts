import type { CSSProperties } from 'react'

export const page: CSSProperties = {
  display: 'grid',
  gap: 16,
  maxWidth: 480,
  margin: '0 auto',
  padding: 24,
  fontFamily: 'var(--font-s)',
}

export const row: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  alignItems: 'center',
}

export const field: CSSProperties = {
  display: 'grid',
  gap: 6,
  padding: 12,
  border: '1px solid #ddd',
  borderRadius: 8,
}

export const input: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '8px 10px',
  fontSize: 16,
  border: '1px solid #ccc',
  borderRadius: 6,
}

export const select: CSSProperties = {
  ...input,
  fontSize: 14,
  cursor: 'pointer',
}

export const button: CSSProperties = {
  padding: '10px 14px',
  fontSize: 14,
  borderRadius: 6,
  border: '1px solid #111',
  background: '#111',
  color: '#fff',
  cursor: 'pointer',
}

export const buttonSecondary: CSSProperties = {
  ...button,
  background: '#fff',
  color: '#111',
}

export const buttonDisabled: CSSProperties = {
  ...button,
  opacity: 0.45,
  cursor: 'not-allowed',
}

export const muted: CSSProperties = {
  margin: 0,
  fontSize: 13,
  opacity: 0.7,
}

export const errorText: CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: '#b00020',
}

export const link: CSSProperties = {
  color: '#111',
  fontSize: 14,
  cursor: 'pointer',
}

export const banner: CSSProperties = {
  ...muted,
  padding: 10,
  borderRadius: 6,
  background: '#f5f5f5',
}
