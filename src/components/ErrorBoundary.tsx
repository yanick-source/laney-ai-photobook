import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
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
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 text-center p-4">
          <h1 className="text-4xl font-bold text-gray-900">Oeps!</h1>
          <p className="mt-2 text-lg text-gray-600">Er is iets misgegaan.</p>
          {this.state.error && (
            <p className="mt-2 text-sm text-red-500 max-w-md bg-red-50 p-2 rounded mx-auto">
              {this.state.error.message}
            </p>
          )}
          <div className="mt-6">
            <Button onClick={() => window.location.reload()}>
              Pagina verversen
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}