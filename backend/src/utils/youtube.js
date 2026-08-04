/**
 * Extracts YouTube Video ID from any valid YouTube URL string.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * @param {string} url
 * @returns {string|null} 11-character YouTube video ID or null
 */
export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  const trimmed = url.trim();
  
  // Standard 11 character video ID pattern
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  
  // Direct 11-char ID input
  if (trimmed.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
};

/**
 * Generates HQ YouTube thumbnail image URL from video ID.
 * @param {string} videoId
 * @returns {string}
 */
export const generateYouTubeThumbnail = (videoId) => {
  if (!videoId) return '';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

/**
 * Validates if string is a supported YouTube URL.
 * @param {string} url
 * @returns {boolean}
 */
export const isValidYouTubeUrl = (url) => {
  return extractYouTubeId(url) !== null;
};
