import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-red-50 text-red-900 min-h-screen flex flex-col items-center justify-center">
          <div className="max-w-2xl w-full bg-white p-8 rounded-xl shadow-xl border border-red-100">
            <h1 className="text-3xl font-bold mb-4 text-red-600">Something went wrong.</h1>
            <pre className="bg-slate-100 p-4 rounded overflow-auto border border-slate-200 text-xs font-mono mb-6 max-h-64 text-slate-700">
              {this.state.error && this.state.error.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;