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

  // If map timed out (>= 5s) or failed to load, display fallback card
  if (hasTimedOut || hasError) {
    return (
      <div
        style={{ height }}
        className={`w-full bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between border border-slate-800 shadow-inner relative overflow-hidden group ${className}`}
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-600/10 rounded-full blur-xl pointer-events-none" />

        <div className="space-y-3 z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FiMapPin className="text-lg" />
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400 block">
                Interactive Map Unavailable
              </span>
              <h4 className="text-base font-bold text-white truncate font-serif">{schoolName}</h4>
            </div>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-sm p-3 rounded-xl border border-slate-700/60 space-y-1">
            <p className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
              <FiMapPin className="text-amber-400 shrink-0 mt-0.5" />
              <span>{address}</span>
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2 z-10">
          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 text-center"
          >
            <FiExternalLink className="shrink-0" />
            <span>Open Maps</span>
          </a>

          <a
            href={googleMapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 text-center"
          >
            <FiNavigation className="shrink-0" />
            <span>Get Directions</span>
          </a>

          <a
            href={phoneTel}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-1.5 active:scale-95 text-center"
          >
            <FiPhone className="shrink-0 text-amber-400" />
            <span>Call School</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ height }}
      className={`w-full relative overflow-hidden bg-slate-100 rounded-2xl border border-slate-200 shadow-sm ${className}`}
    >
      {/* Loading Skeleton */}
      {(!isLoaded || isLoading) && (
        <div className="absolute inset-0 z-10 bg-slate-200 animate-pulse flex flex-col items-center justify-center p-6 space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-300 text-blue-600 flex items-center justify-center animate-bounce shadow-sm">
            <FiMapPin className="text-2xl" />
          </div>
          <div className="space-y-1.5 text-center">
            <div className="h-4 w-44 bg-slate-300 rounded-md mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading Google Map location...</p>
          </div>
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
    </div>
  );
});

GoogleMap.displayName = 'GoogleMap';

export default GoogleMap;
