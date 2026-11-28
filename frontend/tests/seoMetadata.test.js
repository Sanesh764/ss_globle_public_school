import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_ROUTE_SEO, PUBLIC_ROUTE_SEO_LIST } from '../src/utils/seoRoutesConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

const PUBLIC_PAGE_ROUTE_MAP = [
  ['src/pages/public/Home.jsx', '/'],
  ['src/pages/public/About.jsx', '/about'],
  ['src/pages/public/StudentRegistration.jsx', '/register'],
  ['src/pages/public/Facilities.jsx', '/facilities'],
  ['src/pages/public/Contact.jsx', '/contact'],
  ['src/pages/public/NoticeBoard.jsx', '/notices'],
  ['src/pages/public/Downloads.jsx', '/downloads'],
  ['src/pages/public/Gallery.jsx', '/gallery'],
  ['src/pages/public/VideoGallery.jsx', '/videos'],
];

describe('Stage 2 Public Page Metadata & Anti-Cannibalization Tests', () => {
  test('1. Every indexable public page has a unique title and unique meta description via PUBLIC_ROUTE_SEO', () => {
    const titles = new Set();
    const descriptions = new Set();

    assert.equal(PUBLIC_ROUTE_SEO_LIST.length, PUBLIC_PAGE_ROUTE_MAP.length);

    for (const [relPath, routePath] of PUBLIC_PAGE_ROUTE_MAP) {
      const routeConfig = PUBLIC_ROUTE_SEO[routePath];
      assert.ok(routeConfig, `PUBLIC_ROUTE_SEO must define ${routePath}`);

      const { title, description, canonicalUrl } = routeConfig;
      assert.ok(title, `${routePath} must define title`);
      assert.ok(description, `${routePath} must define description`);
      assert.ok(canonicalUrl, `${routePath} must define canonicalUrl`);
      assert.equal(titles.has(title), false, `Duplicate title found for ${routePath}: ${title}`);
      assert.equal(
        descriptions.has(description),
        false,
        `Duplicate description found for ${routePath}: ${description}`
      );
      assert.equal(/Best School|Best CBSE School/i.test(title), false, `Unsupported "Best" claim in ${routePath}`);

      const source = fs.readFileSync(path.join(frontendRoot, relPath), 'utf8');
      const seoMatch = source.match(/<SEO[\s\S]*?\/>/);
      assert.ok(seoMatch, `${relPath} must render <SEO ... />`);
      assert.ok(
        source.includes(`PUBLIC_ROUTE_SEO['${routePath}']`),
        `${relPath} must reference PUBLIC_ROUTE_SEO['${routePath}']`
      );
      const usesDirectProps =
        seoMatch[0].includes(`PUBLIC_ROUTE_SEO['${routePath}'].title`) &&
        seoMatch[0].includes(`PUBLIC_ROUTE_SEO['${routePath}'].description`) &&
        seoMatch[0].includes(`PUBLIC_ROUTE_SEO['${routePath}'].canonicalUrl`);
      const usesSeoMetaVar =
        source.includes(`const seoMeta = PUBLIC_ROUTE_SEO['${routePath}']`) &&
        seoMatch[0].includes('seoMeta.title') &&
        seoMatch[0].includes('seoMeta.description') &&
        seoMatch[0].includes('seoMeta.canonicalUrl');
      assert.ok(
        usesDirectProps || usesSeoMetaVar,
        `${relPath} must pass title, description, and canonicalUrl from PUBLIC_ROUTE_SEO['${routePath}']`
      );
      assert.equal(/\bkeywords\s*=/.test(seoMatch[0]), false, `Keyword stuffing prop should not be used in ${relPath}`);

      titles.add(title);
      descriptions.add(description);
    }

    assert.equal(titles.size, PUBLIC_PAGE_ROUTE_MAP.length);
    assert.equal(descriptions.size, PUBLIC_PAGE_ROUTE_MAP.length);
  });

  test('2. index.html and SEO.jsx remove keyword-stuffed meta keywords and use consistent fallback metadata', () => {
    const html = fs.readFileSync(path.join(frontendRoot, 'index.html'), 'utf8');
    const seo = fs.readFileSync(path.join(frontendRoot, 'src/components/common/SEO.jsx'), 'utf8');

    assert.equal(html.includes('name="keywords"'), false);
    assert.equal(/Best CBSE School/i.test(html), false);
    assert.match(seo, /keywords = ''/);
    assert.equal(/Best CBSE School/i.test(seo), false);
  });
});
