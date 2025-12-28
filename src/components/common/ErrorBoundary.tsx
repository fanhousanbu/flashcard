import { Component } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryContent error={this.state.error} />;
    }

    return this.props.children;
  }
}

function ErrorBoundaryContent({ error }: { error?: Error }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('errors.title')}</h2>
        <p className="text-gray-600 mb-4">
          {t('errors.message')}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
        >
          {t('errors.reload')}
        </button>
        {error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              {t('errors.details')}
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.toString()}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

