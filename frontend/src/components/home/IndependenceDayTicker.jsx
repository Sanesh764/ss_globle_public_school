import React from 'react';
import { isIndependenceDay2026 } from '../../utils/formatDate';

const IndependenceDayTicker = () => {
  if (!isIndependenceDay2026()) {
    return null;
  }

  const tickerMessage = (
    <div className="flex items-center gap-6 md:gap-8 px-4 shrink-0 whitespace-nowrap text-xs sm:text-sm font-semibold tracking-wide text-amber-300">
      <span className="inline-flex items-center gap-1.5 font-bold text-white bg-slate-900/90 px-2.5 py-0.5 rounded-full border border-amber-400/40 shrink-0 whitespace-nowrap">
        <span className="shrink-0">🇮🇳</span>
        <span className="whitespace-nowrap shrink-0">Happy Independence Day 2026</span>
        <span className="shrink-0">🇮🇳</span>
      </span>
      <span className="text-amber-500/70 font-normal select-none shrink-0">• ✦ •</span>
      <span className="text-slate-200 whitespace-nowrap shrink-0">Celebrating Freedom • Unity • Education</span>
      <span className="text-amber-500/70 font-normal select-none shrink-0">• ✦ •</span>
      <span className="text-emerald-300 whitespace-nowrap shrink-0">Honouring the Spirit of India</span>
      <span className="text-amber-500/70 font-normal select-none shrink-0">• ✦ •</span>
      <span className="text-orange-300 whitespace-nowrap shrink-0">Inspiring the Next Generation of a Stronger India</span>
      <span className="text-amber-500/70 font-normal select-none shrink-0">• ✦ •</span>
    </div>
  );

  return (
    <div className="w-full bg-slate-950 border-b border-amber-500/30 overflow-hidden relative z-30 select-none shadow-md h-9 sm:h-10 flex items-center font-sans">
      {/* Top Subtle Tricolor Accent Bar */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500 via-white to-emerald-500 opacity-90 pointer-events-none" />
      
      {/* Horizontal Seamless Scrolling Track (4 Duplicated Sequences for Flawless Loop on All Displays) */}
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
