export const DEFAULT_GOOGLE_MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14457.942738743126!2d84.39864225!3d25.034509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398d5c89839446d3%3A0x6b19451ba21d604b!2sDaudnagar%2C%20Bihar!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin';

/**
 * Validates whether a raw URL string is an official, iframe-compatible Google Maps Embed URL.
 * Rejects normal Google Maps page URLs, maps.app.goo.gl, goo.gl, etc.
 */
export const isValidGoogleMapEmbedUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return false;

  let urlStr = rawUrl.trim();

  // If user pasted full iframe tag like <iframe src="...">
  if (urlStr.includes('<iframe') && urlStr.includes('src=')) {
    const srcMatch = urlStr.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      urlStr = srcMatch[1].trim();
    }
  }

  const isEmbedPrefix =
    urlStr.startsWith('https://www.google.com/maps/embed') ||
    urlStr.startsWith('https://google.com/maps/embed') ||
    urlStr.startsWith('https://www.google.com/maps/embed/v1/');

  // Explicit check to reject non-embed page URLs or short links
  const isRejected =
    urlStr.includes('maps.app.goo.gl') ||
    urlStr.includes('goo.gl/') ||
    urlStr.includes('/maps/place/') ||
    urlStr.includes('maps.google.com/?') ||
    (urlStr.includes('google.com/maps') && !urlStr.includes('/maps/embed'));

  return isEmbedPrefix && !isRejected;
};

/**
 * Extracts and sanitizes a raw Google Maps URL.
 * Returns valid embed URL if valid, or default official school embed URL if invalid/missing.
 */
export const sanitizeGoogleMapUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return DEFAULT_GOOGLE_MAP_EMBED_URL;
  }

  let trimmed = rawUrl.trim();

  // Handle iframe code paste
  if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
    const srcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      trimmed = srcMatch[1].trim();
    }
  }

  if (isValidGoogleMapEmbedUrl(trimmed)) {
    return trimmed;
  }

  return DEFAULT_GOOGLE_MAP_EMBED_URL;
};
