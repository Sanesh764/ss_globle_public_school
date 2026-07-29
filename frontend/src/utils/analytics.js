/**
 * Google Analytics 4 (gtag.js) Utility Module
 * Measurement ID: G-PF8ZK3JD48
 */

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-PF8ZK3JD48';

/**
 * Safely invokes window.gtag if present in window scope.
 */
export const gtag = (...args) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  } else if (import.meta.env.DEV) {
    console.log('[GA4 Dev Track]:', ...args);
  }
};

/**
 * Track SPA route changes and page_view events.
 */
export const trackPageView = (path, title) => {
  const pagePath = path || window.location.pathname + window.location.search;
  const pageTitle = title || document.title;

  gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: window.location.href,
    send_to: GA_MEASUREMENT_ID,
  });
};

/**
 * Track custom GA4 events.
 */
export const trackEvent = (eventName, params = {}) => {
  gtag('event', eventName, {
    send_to: GA_MEASUREMENT_ID,
    ...params,
  });
};

/**
 * Specialized Tracker Helpers required by application features
 */

// 1. Outbound Link Clicks
export const trackOutboundLink = (url, label = '') => {
  trackEvent('click', {
    event_category: 'outbound',
    event_label: label || url,
    outbound_url: url,
  });
};

// 2. File Downloads
export const trackFileDownload = (fileName, fileUrl = '') => {
  trackEvent('file_download', {
    event_category: 'download',
    event_label: fileName,
    file_name: fileName,
    file_url: fileUrl,
  });
};

// 3. Contact Button Clicks
export const trackContactClick = (buttonName = 'Contact Button') => {
  trackEvent('click', {
    event_category: 'contact',
    event_label: buttonName,
    button_name: buttonName,
  });
};

// 4. Admission Open Button Clicks
export const trackAdmissionClick = (source = 'Navbar/Banner') => {
  trackEvent('click', {
    event_category: 'admission',
    event_label: source,
    admission_source: source,
  });
};

// 5. Gallery Image Clicks
export const trackGalleryImageClick = (imageTitle, category = 'General') => {
  trackEvent('select_content', {
    content_type: 'image',
    item_id: imageTitle,
    category: category,
  });
};

// 6. Notice Document Downloads
export const trackNoticeDownload = (noticeTitle, attachmentUrl = '') => {
  trackEvent('file_download', {
    event_category: 'notice',
    notice_title: noticeTitle,
    attachment_url: attachmentUrl,
  });
};
