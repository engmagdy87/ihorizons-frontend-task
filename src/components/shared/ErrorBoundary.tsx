import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Alert, Box } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ padding: 3 }}>
          <Alert severity="error">
            Something went wrong. Please refresh the page.
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: 10 }}>
                {this.state.error.toString()}
              </details>
            )}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}
