import React, { Component } from 'react';
import Warning from '@/assets/warning.svg?react';
import { Button } from './ui/button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      childrenNames: '{Please define names for the boundaries}' // default value
    };
  }
  
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  static handleRefresh = () => {
    window.location.reload();
  }

  componentDidMount() {
    const childrenNames = React.Children.map(this.props.children, (child) => child.type.name || 'Unknown').join(', ');
    this.setState({ childrenNames });
  }

  componmentDidCatch(error, errorInfo) {
    const { childrenNames } = this.state;
    console.error(`Error in boundaries "${childrenNames}":`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col justify-center items-center text-center min-w-screen min-h-screen px-4 bg-muted">
          <div className="max-w-md w-full p-6 bg-white rounded-2xl shadow-md border border-gray-200 flex flex-col items-center">
            <div className="text-4xl font-bold text-destructive mb-4"> Something went wrong </div>
            <Warning className="w-20 h-20"/>
            <p className="text-muted-foreground mb-2 mt-4">
              There was a problem processing your request. Please try again.
            </p>
            <p className="text-sm text-gray-500 italic mb-4">
              {this.state.error?.message || 'An unknown error occurred.'}
            </p>
            <Button onClick={ErrorBoundary.handleRefresh}>
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;