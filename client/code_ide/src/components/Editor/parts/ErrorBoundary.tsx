import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Copy } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  private handleCopyError = async () => {
    if (!this.state.error) return;

    await navigator.clipboard.writeText(
      `${this.state.error.message}\n\n${this.state.error.stack || ""}`
    );
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100 p-6 font-sans">

          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">

            {/* ICON */}
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>

            {/* TEXT */}
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight">
                Something went wrong
              </h1>
              <p className="text-sm text-zinc-400">
                The editor crashed unexpectedly. You can retry or return safely.
              </p>
            </div>

            {/* ERROR BOX */}
            {this.state.error && (
              <div className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg p-3 text-left overflow-hidden">
                <code className="text-[10px] text-zinc-500 block break-all font-mono">
                  {this.state.error.message}
                </code>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex items-center gap-2 w-full">

              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 h-10 bg-zinc-100 text-zinc-950 rounded-lg text-sm font-semibold hover:bg-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>

              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="flex-1 flex items-center justify-center gap-2 h-10 bg-zinc-800 text-zinc-100 rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={this.handleCopyError}
                className="h-10 w-10 flex items-center justify-center bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                title="Copy error"
              >
                <Copy className="w-4 h-4" />
              </button>

            </div>
          </div>

          <p className="mt-8 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
            CodeSpace IDE Runtime Guard
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
