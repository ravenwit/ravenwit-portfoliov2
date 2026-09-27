import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-8 max-w-xl mx-auto my-12 rounded-2xl border border-rose/40 bg-rose/[0.08] backdrop-blur-md text-ink shadow-2xl">
          <div className="flex items-center gap-3 mb-3 text-rose">
            <AlertTriangle size={24} />
            <h3 className="mono text-base font-bold">Rendering Diagnostic Exception</h3>
          </div>
          <p className="text-sm text-muted mb-4 leading-relaxed">
            An unexpected error occurred while rendering this view. The state was isolated to prevent a black screen crash.
          </p>
          <div className="mono text-xs bg-void/80 border border-line-bright p-3 rounded-xl overflow-x-auto text-rose/90 mb-4">
            {this.state.error?.message || "Unknown error"}
          </div>
          <button
            onClick={this.handleReset}
            className="chip !py-2 !px-4 !text-xs cursor-pointer !text-quantum !border-quantum/50 hover:!bg-quantum/10 flex items-center gap-2"
          >
            <RefreshCw size={13} /> Reload View State
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
