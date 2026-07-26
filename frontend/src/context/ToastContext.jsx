import React, { createContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 border-emerald-700 text-emerald-100 backdrop-blur-md'
                : toast.type === 'error'
                ? 'bg-rose-900/90 border-rose-700 text-rose-100 backdrop-blur-md'
                : 'bg-slate-900/90 border-slate-700 text-slate-100 backdrop-blur-md'
            }`}
          >
            <div className="mt-0.5 text-lg shrink-0">
              {toast.type === 'success' && <FiCheckCircle className="text-emerald-400" />}
              {toast.type === 'error' && <FiAlertCircle className="text-rose-400" />}
              {toast.type === 'info' && <FiInfo className="text-blue-400" />}
            </div>
            <div className="flex-1">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Close notification"
            >
              <FiX className="text-base" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
