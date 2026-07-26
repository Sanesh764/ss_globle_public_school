import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { SettingProvider } from './context/SettingContext';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
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
