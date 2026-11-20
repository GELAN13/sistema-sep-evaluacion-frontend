import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppRoutes } from './routes/AppRoutes';
import './index.css';

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
