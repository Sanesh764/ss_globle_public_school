import React from 'react';
import { FiAlertTriangle, FiHome } from 'react-icons/fi';

const ErrorFallback = ({ error: _error, resetErrorBoundary }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="text-center max-w-md space-y-6 bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
        <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-4xl mx-auto shadow-inner">
          <FiAlertTriangle />
        </div>
        <h2 className="text-2xl font-bold font-serif text-slate-900">Something Went Wrong</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          An unexpected application error occurred.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {resetErrorBoundary && (
            <button
              onClick={resetErrorBoundary}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              Try Again
            </button>
          )}
          <a
            href="/"
            className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors"
          >
            <FiHome /> Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
