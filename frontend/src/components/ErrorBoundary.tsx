import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children:  ReactNode
  fallback?: ReactNode
  onError?:  (error: Error, info: ErrorInfo) => void
}

interface State {
  hasError:   boolean
  error:      Error | null
  errorCount: number
}

/**
 * Production-ready Error Boundary.
 * Catches render errors in child components and shows a styled fallback UI.
 * Auto-resets after user clicks "Retry".
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorCount: 0 }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
    this.props.onError?.(error, info)
    this.setState(s => ({ errorCount: s.errorCount + 1 }))
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-rose-500/20 bg-rose-500/5"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Something went wrong</h3>
          <p className="text-sm text-slate-400 mb-5 max-w-xs">
            {this.state.error?.message ?? 'An unexpected error occurred in this section.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                       bg-rose-500/10 border border-rose-500/25 text-rose-400
                       hover:bg-rose-500/15 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre className="mt-4 text-left text-[10px] text-slate-500 bg-slate-900 p-3 rounded-xl overflow-auto max-w-full max-h-40">
              {this.state.error.stack}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
