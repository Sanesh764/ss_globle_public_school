import React from 'react';
import { FiWifiOff, FiRefreshCw } from 'react-icons/fi';

const NetworkError = ({ onRetry }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 bg-[#F4EFE3]">
      <div className="text-center max-w-md space-y-5 bg-[#EBE2CC] p-8 rounded-sm border border-[#CFC5B1]">
        <div className="w-14 h-14 rounded-sm bg-[#F4EFE3] border border-[#CFC5B1] text-[#55594E] flex items-center justify-center text-2xl mx-auto">
          <FiWifiOff />
        </div>
        <h2 className="text-xl font-bold font-serif text-[#34483B]">Server Connection Unavailable</h2>
        <p className="text-[#55594E] text-sm leading-relaxed">
          Unable to connect to the backend server. Please verify your internet connection or check if the server is starting up.
        </p>
        <div>
          <button
            onClick={onRetry || (() => window.location.reload())}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-xs rounded-sm transition-colors"
          >
            <FiRefreshCw className="text-[#AD8746]" /> Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkError;
