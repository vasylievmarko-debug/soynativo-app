import React from 'react';
import { EmptyState } from './EmptyState';

interface State {
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

/**
 * Class component because React only supports error boundaries via class API.
 * Wrap each top-level navigator and any screen with risky external content
 * (3rd-party SDK, video player) so a single crash doesn't take down the app.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error, info);
    // TODO: forward to Sentry once configured.
  }

  reset = (): void => this.setState({ error: null });

  render(): React.ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <EmptyState
        title="Something went wrong"
        description={error.message}
        actionLabel="Try again"
        onAction={this.reset}
      />
    );
  }
}
