import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
    errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        this.setState({ error, errorInfo })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-screen bg-red-50 dark:bg-red-900">
                    <div className="text-center max-w-md mx-auto p-6">
                        <div className="text-red-600 dark:text-red-400 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
                            Something went wrong
                        </h1>
                        <p className="text-red-600 dark:text-red-300 mb-6">
                            An unexpected error occurred. Please try refreshing the application.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                                Reload Application
                            </button>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="text-left">
                                    <summary className="cursor-pointer text-red-600 dark:text-red-300 mb-2">
                                        Error Details
                                    </summary>
                                    <pre className="text-xs text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-800 p-2 rounded overflow-auto">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
