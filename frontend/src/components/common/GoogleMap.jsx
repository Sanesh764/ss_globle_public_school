import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { FiMapPin, FiNavigation, FiExternalLink, FiPhone } from 'react-icons/fi';
import { sanitizeGoogleMapUrl } from '../../utils/mapUtils';

const GoogleMap = memo(({
  src,
  url,
  title = 'School Location',
  schoolName = 'S.S. Global Public School',
  address = 'Sambhu Nagar, Near Teacher Training College, Daudnagar, Bihar – 824143',
  phone = '+91 98765 43210',
  height = '100%',
  className = '',
  timeoutMs = 5000,
}) => {
  const rawTargetUrl = src || url;
  const embedUrl = useMemo(() => sanitizeGoogleMapUrl(rawTargetUrl), [rawTargetUrl]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsLoaded(false);
    setHasTimedOut(false);
    setHasError(false);

    const timer = setTimeout(() => {
      setHasTimedOut(true);
      setIsLoading(false);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [embedUrl, timeoutMs]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  const searchQuery = encodeURIComponent(`${schoolName} Daudnagar Bihar`);
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${searchQuery}`;
  const phoneTel = `tel:${phone.replace(/[^\d+]/g, '')}`;

  return (
    <div
      style={{ height }}
      className={`w-full bg-slate-900/90 text-white rounded-3xl p-3.5 flex flex-col justify-between border border-slate-800 shadow-2xl shadow-blue-950/30 relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300 ${className}`}
    >
      {/* Soft Decorative Ambient Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

      {/* Main Map Viewport / Fallback Container */}
      <div className="relative w-full flex-1 min-h-[140px] sm:min-h-[160px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col">
        {hasTimedOut || hasError ? (
          <div className="w-full h-full p-4 flex flex-col justify-between bg-slate-950 relative">
            <div className="space-y-2 z-10">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-400/30">
                  <FiMapPin className="text-base" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400 block">
                    Interactive Map Preview
                  </span>
                  <h4 className="text-sm font-bold text-white truncate font-serif">{schoolName}</h4>
                </div>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                  <FiMapPin className="text-amber-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{address}</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Loading Skeleton */}
            {(!isLoaded || isLoading) && (
              <div className="absolute inset-0 z-10 bg-slate-900 animate-pulse flex flex-col items-center justify-center p-4 space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 flex items-center justify-center animate-bounce">
                  <FiMapPin className="text-xl" />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Loading Google Map...</p>
              </div>
            )}

            {/* Official Google Map Embed IFrame */}
            <iframe
              title={title}
              src={embedUrl}
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={handleLoad}
              onError={handleError}
              style={{ border: 0 }}
              className={`w-full h-full transition-opacity duration-500 border-0 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        )}
      </div>

      {/* Permanently Visible Action Bar with 3 Essential Buttons */}
      <div className="pt-3 grid grid-cols-3 gap-1.5 sm:gap-2 z-10">
        <a
          href={googleMapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 sm:px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] sm:text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-1 shadow-md shadow-blue-600/25 text-center active:scale-95 shrink-0 whitespace-nowrap"
          title="Open Location in Google Maps"
        >
          <FiExternalLink className="shrink-0 text-xs sm:text-sm" />
          <span>Open Maps</span>
        </a>

        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 sm:px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-1 shadow-md shadow-emerald-600/25 text-center active:scale-95 shrink-0 whitespace-nowrap"
          title="Get Driving Directions"
        >
          <FiNavigation className="shrink-0 text-xs sm:text-sm" />
          <span>Directions</span>
        </a>

        <a
          href={phoneTel}
          className="px-2 sm:px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-[11px] sm:text-xs rounded-xl border border-slate-700 transition-all duration-200 flex items-center justify-center gap-1 text-center active:scale-95 shrink-0 whitespace-nowrap"
          title="Call School Office"
        >
          <FiPhone className="shrink-0 text-amber-400 text-xs sm:text-sm" />
          <span>Call School</span>
        </a>
      </div>
    </div>
  );
});

GoogleMap.displayName = 'GoogleMap';

export default GoogleMap;
