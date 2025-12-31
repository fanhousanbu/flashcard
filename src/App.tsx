import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AnimatedRoutes } from './routes/AnimatedRoutes';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Toaster
            position="top-center"
            richColors
            duration={3000}
            closeButton
            toastOptions={{
              style: {
                maxWidth: 'calc(100vw - 32px)',
                margin: '16px auto',
                padding: '12px 16px',
                fontSize: '14px',
              },
              classNames: {
                success: 'bg-green-600 text-white',
                error: 'bg-red-500 text-white',
                warning: 'bg-yellow-500 text-white',
                info: 'bg-blue-600 text-white',
              },
            }}
          />
          <AnimatedRoutes />
      </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
