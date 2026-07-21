import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { isDev } from '@/lib/env'

interface ErrorBoundaryProps {
  children: ReactNode
  fallbackTitle?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  message: string
  resetKey: number
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error) return error
  return 'Something went wrong'
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
    message: '',
    resetKey: 0,
  }

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      message: getErrorMessage(error),
    }
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    if (isDev) {
      console.error('ErrorBoundary caught', error, info.componentStack)
    }
  }

  private handleReset = () => {
    this.setState((prev) => ({
      hasError: false,
      message: '',
      resetKey: prev.resetKey + 1,
    }))
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center"
        >
          <h1 className="text-2xl font-semibold tracking-tight">
            {this.props.fallbackTitle ?? 'Something went wrong'}
          </h1>
          <p className="text-sm text-muted-foreground">{this.state.message}</p>
          <div className="flex gap-2">
            <Button onClick={this.handleReset}>Try again</Button>
            <Button variant="outline" onClick={() => window.location.assign('/')}>
              Go home
            </Button>
          </div>
        </div>
      )
    }

    return <div key={this.state.resetKey}>{this.props.children}</div>
  }
}
