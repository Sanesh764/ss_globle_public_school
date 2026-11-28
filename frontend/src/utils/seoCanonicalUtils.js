export const CANONICAL_DOMAIN = 'https://www.ssglobalpublicschool.com';

/**
 * Normalize a route path or URL into a single canonical production URL.
 * - Always uses https://www.ssglobalpublicschool.com
 * - Preserves root trailing slash: https://www.ssglobalpublicschool.com/
 * - Strips trailing slashes on non-root routes to match sitemap.xml
 * - Strips query parameters and hash fragments
 */
export const formatCanonicalUrl = (passedUrl, currentPathname = '/') => {
  const rawInput =
    typeof passedUrl === 'string' && passedUrl.trim() !== ''
      ? passedUrl.trim()
      : typeof currentPathname === 'string' && currentPathname.trim() !== ''
      ? currentPathname.trim()
      : '/';

  let pathname = '/';

  if (/^https?:\/\//i.test(rawInput)) {
    try {
      const urlObj = new URL(rawInput);
      pathname = urlObj.pathname || '/';
    } catch {
      pathname = '/';
    }
  } else {
    const withoutFragment = rawInput.split('#')[0];
    const withoutQuery = withoutFragment.split('?')[0];
    pathname = withoutQuery || '/';
  }

  pathname = pathname.replace(/\/{2,}/g, '/');
  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  if (pathname === '/') {
    return `${CANONICAL_DOMAIN}/`;
  }

  const trimmedPath = pathname.replace(/\/+$/, '');
  return `${CANONICAL_DOMAIN}${trimmedPath || '/'}`;
};
