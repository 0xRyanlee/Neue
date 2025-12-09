import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

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
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mb-6" />
                    <h1 className="text-3xl font-black tracking-tighter mb-2">CRITICAL ERROR</h1>
                    <p className="text-gray-500 mb-8 max-w-md">
                        The studio needs a moment. Please reload to reset the simulation.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={() => window.location.reload()}>
                            RELOAD STUDIO
                        </Button>
                        <Button variant="outline" onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}>
                            FACTORY RESET
                        </Button>
                    </div>
                    <pre className="mt-8 p-4 bg-gray-100 rounded text-xs text-left overflow-auto max-w-lg text-red-800">
                        {this.state.error?.message}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}
