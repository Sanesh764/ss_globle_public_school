import React from 'react';

const LoadingSpinner = ({ fullScreen = false, text = 'Loading...' }) => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 rounded-full border-2 border-[#CFC5B1] border-t-[#34483B] animate-spin"></div>
        <div
          className="absolute top-0 left-0 w-10 h-10 rounded-full border-2 border-[#AD8746] border-b-transparent animate-spin opacity-70"
          style={{ animationDirection: 'reverse', animationDuration: '1.4s' }}
        ></div>
      </div>
      {text && <p className="mt-4 text-xs font-medium tracking-wider uppercase text-[#55594E]">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#252821]/40 backdrop-blur-xs flex items-center justify-center">
        <div className="bg-[#F4EFE3] p-6 rounded-sm border border-[#CFC5B1] shadow-lg flex flex-col items-center">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
