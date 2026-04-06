import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-6 bg-white dark:bg-[#191919] text-zinc-900 dark:text-white p-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">오류가 발생했습니다</h1>
            <p className="text-zinc-500 text-sm max-w-sm">
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.
            </p>
            {this.state.error && (
              <pre className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs text-left text-zinc-600 dark:text-zinc-400 max-w-sm overflow-auto">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all"
          >
            <RefreshCw size={16} />
            페이지 새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
