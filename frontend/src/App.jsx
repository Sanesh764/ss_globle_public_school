import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { SettingProvider } from './context/SettingContext';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import RouteTracker from './components/common/RouteTracker';

function App() {
  return (
    <BrowserRouter>
      <RouteTracker />
      <ToastProvider>
        <SettingProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </SettingProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
