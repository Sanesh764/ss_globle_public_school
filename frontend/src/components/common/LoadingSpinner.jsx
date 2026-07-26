import React from 'react';

const LoadingSpinner = ({ fullScreen = false, text = 'Loading...' }) => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-amber-400 border-b-transparent animate-spin opacity-60" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      {text && <p className="mt-4 text-sm font-medium text-slate-600 animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
