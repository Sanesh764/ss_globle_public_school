import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CANONICAL_DOMAIN, formatCanonicalUrl } from '../src/utils/seoCanonicalUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

describe('Stage 3 Canonical URL Normalization Tests', () => {
  test('1. Uses production domain and keeps root trailing slash only on homepage', () => {
    assert.equal(CANONICAL_DOMAIN, 'https://www.ssglobalpublicschool.com');
    assert.equal(formatCanonicalUrl('/', '/'), 'https://www.ssglobalpublicschool.com/');
    assert.equal(formatCanonicalUrl(undefined, '/'), 'https://www.ssglobalpublicschool.com/');
    assert.equal(
      formatCanonicalUrl('https://ssglobalpublicschool.com/', '/'),
      'https://www.ssglobalpublicschool.com/'
    );
  });

  test('2. Normalizes trailing slashes, query parameters, and hash fragments on non-root routes', () => {
    assert.equal(formatCanonicalUrl(undefined, '/about'), 'https://www.ssglobalpublicschool.com/about');
    assert.equal(formatCanonicalUrl(undefined, '/about/'), 'https://www.ssglobalpublicschool.com/about');
    assert.equal(
      formatCanonicalUrl('/contact/?utm_source=google#map', '/contact/'),
      'https://www.ssglobalpublicschool.com/contact'
    );
    assert.equal(
      formatCanonicalUrl('https://ssglobalpublicschool.com/facilities/?ref=home#labs', '/facilities'),
      'https://www.ssglobalpublicschool.com/facilities'
    );
    assert.equal(
      formatCanonicalUrl('http://www.ssglobalpublicschool.com/register/', '/register'),
      'https://www.ssglobalpublicschool.com/register'
    );
  });

  test('3. Does not canonicalize subpages to homepage and removes canonical on noindex pages', () => {
    const subRoutes = ['/about', '/facilities', '/gallery', '/videos', '/notices', '/downloads', '/contact', '/register'];
    for (const route of subRoutes) {
      assert.equal(formatCanonicalUrl(undefined, route), `https://www.ssglobalpublicschool.com${route}`);
    }

    const seoSource = fs.readFileSync(path.join(frontendRoot, 'src/components/common/SEO.jsx'), 'utf8');
    assert.match(seoSource, /if \(noindex\) \{[\s\S]*existingCanonicals\.forEach\(\(el\) => el\.remove\(\)\)/);
  });
});
