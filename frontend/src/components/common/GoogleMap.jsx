import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { FiMapPin, FiNavigation, FiExternalLink, FiPhone } from 'react-icons/fi';
import { sanitizeGoogleMapUrl } from '../../utils/mapUtils';

const GoogleMap = memo(({
  src,
  url,
  title = 'School Location',
  schoolName = 'S.S. Global Public School',
  address = 'Sambhu Nagar, Near Teacher Training College, Daudnagar, Bihar – 824143',
  phone = '+91 9122490003',
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
      className={`w-full bg-[#F4EFE3] text-[#252821] rounded-sm flex flex-col justify-between border border-[#CFC5B1] overflow-hidden ${className}`}
    >
      {/* Top Institutional Map Bar */}
      <div className="px-3.5 py-2.5 bg-[#EBE2CC] border-b border-[#CFC5B1] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FiMapPin className="text-[#AD8746] text-sm shrink-0" />
          <span className="text-xs font-serif font-bold text-[#34483B] truncate">
            {schoolName}
          </span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#55594E] shrink-0 hidden sm:inline">
          Daudnagar, Bihar
        </span>
      </div>

      {/* Main Map Viewport / Fallback Container */}
      <div className="relative w-full flex-1 min-h-[160px] bg-[#DED5C1] flex flex-col">
        {hasTimedOut || hasError ? (
          <div className="w-full h-full p-5 flex flex-col justify-center bg-[#F4EFE3]">
            <div className="space-y-3 max-w-sm mx-auto text-center">
              <div className="w-10 h-10 rounded-sm bg-[#EBE2CC] border border-[#CFC5B1] text-[#34483B] flex items-center justify-center mx-auto">
                <FiMapPin className="text-lg text-[#AD8746]" />
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#AD8746] block">
                  Campus Location
                </span>
                <h4 className="text-sm font-bold text-[#34483B] font-serif mt-0.5">{schoolName}</h4>
              </div>
              <p className="text-xs text-[#55594E] leading-relaxed bg-[#EBE2CC]/60 p-3 rounded-sm border border-[#CFC5B1]">
                {address}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Subtle Loading State */}
            {(!isLoaded || isLoading) && (
              <div className="absolute inset-0 z-10 bg-[#EBE2CC] flex flex-col items-center justify-center p-4 space-y-2">
                <div className="w-9 h-9 rounded-sm bg-[#F4EFE3] border border-[#CFC5B1] text-[#34483B] flex items-center justify-center">
                  <FiMapPin className="text-base text-[#AD8746]" />
                </div>
                <p className="text-[11px] text-[#55594E] font-medium tracking-wide uppercase">
                  Loading Campus Map...
                </p>
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

      {/* Clean Architectural Action Bar */}
      <div className="p-2.5 bg-[#EBE2CC]/80 border-t border-[#CFC5B1] grid grid-cols-3 gap-2 shrink-0">
        <a
          href={googleMapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 sm:px-3 py-2 bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-[11px] sm:text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5 text-center shrink-0 whitespace-nowrap"
          title="Open Location in Google Maps"
        >
          <FiExternalLink className="shrink-0 text-xs text-[#AD8746]" />
          <span>Open Maps</span>
        </a>

        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 sm:px-3 py-2 bg-[#AD8746] hover:bg-[#8E6D35] text-white font-semibold text-[11px] sm:text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5 text-center shrink-0 whitespace-nowrap"
          title="Get Driving Directions"
        >
          <FiNavigation className="shrink-0 text-xs" />
          <span>Directions</span>
        </a>

        <a
          href={phoneTel}
          className="px-2 sm:px-3 py-2 bg-[#F4EFE3] hover:bg-[#DED5C1] text-[#34483B] font-semibold text-[11px] sm:text-xs rounded-sm border border-[#CFC5B1] transition-colors flex items-center justify-center gap-1.5 text-center shrink-0 whitespace-nowrap"
          title="Call School Office"
        >
          <FiPhone className="shrink-0 text-[#AD8746] text-xs" />
          <span>Call School</span>
        </a>
      </div>
    </div>
  );
});

GoogleMap.displayName = 'GoogleMap';

export default GoogleMap;
