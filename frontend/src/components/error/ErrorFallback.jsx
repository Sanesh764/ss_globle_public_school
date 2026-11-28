import React from 'react';
import { FiAlertTriangle, FiHome } from 'react-icons/fi';

const ErrorFallback = ({ error: _error, resetErrorBoundary }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-[#F4EFE3]">
      <div className="text-center max-w-md space-y-5 bg-[#EBE2CC] p-10 rounded-sm border border-[#CFC5B1]">
        <div className="w-16 h-16 rounded-sm bg-[#F4EFE3] border border-[#CFC5B1] text-[#7F2E2E] flex items-center justify-center text-3xl mx-auto">
          <FiAlertTriangle />
        </div>
        <h2 className="text-2xl font-bold font-serif text-[#34483B]">Something Went Wrong</h2>
        <p className="text-[#55594E] text-sm leading-relaxed">
          An unexpected application error occurred. Please try again or return to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {resetErrorBoundary && (
            <button
              onClick={resetErrorBoundary}
              className="px-6 py-2.5 bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-xs rounded-sm transition-colors"
            >
              Try Again
            </button>
          )}
          <a
            href="/"
            className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-[#F4EFE3] hover:bg-[#DED5C1] text-[#252821] font-semibold text-xs rounded-sm border border-[#CFC5B1] transition-colors"
          >
            <FiHome /> Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
