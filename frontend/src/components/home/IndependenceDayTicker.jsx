import React from 'react';
import { isIndependenceDay2026 } from '../../utils/formatDate';

const IndependenceDayTicker = () => {
  if (!isIndependenceDay2026()) {
    return null;
  }

  const tickerMessage = (
    <div className="flex items-center gap-6 md:gap-8 px-4 shrink-0 whitespace-nowrap text-xs sm:text-sm font-medium tracking-wide text-[#EBE2CC]">
      <span className="inline-flex items-center gap-1.5 font-semibold text-[#F4EFE3] bg-[#27372D] px-2.5 py-0.5 rounded-sm border border-[#AD8746]/60 shrink-0 whitespace-nowrap">
        <span className="shrink-0">🇮🇳</span>
        <span className="whitespace-nowrap shrink-0">Happy Independence Day 2026</span>
        <span className="shrink-0">🇮🇳</span>
      </span>
      <span className="text-[#AD8746] font-normal select-none shrink-0">•</span>
      <span className="text-[#F4EFE3] whitespace-nowrap shrink-0">Celebrating Freedom • Unity • Education</span>
      <span className="text-[#AD8746] font-normal select-none shrink-0">•</span>
      <span className="text-[#EBE2CC] whitespace-nowrap shrink-0">Honouring the Spirit of India</span>
      <span className="text-[#AD8746] font-normal select-none shrink-0">•</span>
      <span className="text-[#F4EFE3] whitespace-nowrap shrink-0">Inspiring the Next Generation of a Stronger India</span>
      <span className="text-[#AD8746] font-normal select-none shrink-0">•</span>
    </div>
  );

  return (
    <div className="w-full bg-[#34483B] border-b border-[#AD8746]/50 overflow-hidden relative z-30 select-none h-9 sm:h-10 flex items-center font-sans">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#D97706] via-[#F4EFE3] to-[#15803D] opacity-90 pointer-events-none" />

      <div className="w-full overflow-hidden flex items-center">
        <div className="animate-ticker-horizontal flex items-center shrink-0">
          {tickerMessage}
          {tickerMessage}
          {tickerMessage}
          {tickerMessage}
        </div>
      </div>
    </div>
  );
};

export default IndependenceDayTicker;
