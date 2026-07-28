import React from 'react';
import { FiWifiOff, FiRefreshCw } from 'react-icons/fi';

const NetworkError = ({ onRetry }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6 bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-3xl mx-auto shadow-inner">
          <FiWifiOff />
        </div>
        <h2 className="text-xl font-bold font-serif text-slate-800">Server Connection Unavailable</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Unable to connect to the backend server. Please verify your internet connection or check if the server is starting up.
        </p>
        <div>
          <button
            onClick={onRetry || (() => window.location.reload())}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            <FiRefreshCw /> Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkError;
