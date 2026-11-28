import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_ROUTE_SEO_LIST } from '../src/utils/seoRoutesConfig.js';
import { applyRouteMetadataToHtml } from '../scripts/generateStaticRouteHtml.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');
const distDir = path.join(frontendRoot, 'dist');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const countMatches = (text, regex) => (text.match(regex) || []).length;

describe('Stage 9 Static Route HTML Generation Tests', () => {
  test('1. applyRouteMetadataToHtml injects unique route metadata without duplicating tags', () => {
    const sampleShell = `<!doctype html>
<html lang="en">
  <head>
    <title>Default Title</title>
    <meta name="description" content="Default desc" />
    <link rel="canonical" href="https://www.ssglobalpublicschool.com/" />
    <meta property="og:title" content="Default OG Title" />
    <meta property="og:description" content="Default OG Desc" />
    <meta property="og:url" content="https://www.ssglobalpublicschool.com/" />
    <meta property="og:image" content="https://www.ssglobalpublicschool.com/school.webp" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Default TW Title" />
    <meta name="twitter:description" content="Default TW Desc" />
    <meta name="twitter:url" content="https://www.ssglobalpublicschool.com/" />
    <meta name="twitter:image" content="https://www.ssglobalpublicschool.com/school.webp" />
    <script type="module" crossorigin src="/assets/index-abc.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-abc.css">
  </head>
  <body><div id="root"></div></body>
</html>`;

    const registerConfig = PUBLIC_ROUTE_SEO_LIST.find((r) => r.path === '/register');
    const output = applyRouteMetadataToHtml(sampleShell, registerConfig);

    assert.equal(countMatches(output, /<title>/gi), 1);
    assert.equal(countMatches(output, /<meta\s+[^>]*name="description"/gi), 1);
    assert.equal(countMatches(output, /<link\s+[^>]*rel="canonical"/gi), 1);
    assert.equal(countMatches(output, /<meta\s+[^>]*property="og:title"/gi), 1);
    assert.equal(countMatches(output, /<meta\s+[^>]*property="og:description"/gi), 1);
    assert.equal(countMatches(output, /<meta\s+[^>]*property="og:url"/gi), 1);
    assert.equal(countMatches(output, /<meta\s+[^>]*property="og:image"/gi), 1);
    assert.equal(countMatches(output, /<meta\s+[^>]*name="twitter:card"/gi), 1);
    assert.equal(countMatches(output, /<meta\s+[^>]*name="twitter:title"/gi), 1);
    assert.equal(countMatches(output, /<meta\s+[^>]*name="twitter:description"/gi), 1);
    assert.equal(countMatches(output, /<meta\s+[^>]*name="twitter:url"/gi), 1);
    assert.equal(countMatches(output, /<meta\s+[^>]*name="twitter:image"/gi), 1);
    assert.equal(countMatches(output, /property="twitter:/gi), 0);

    assert.match(output, /src="\/assets\/index-abc\.js"/);
    assert.match(output, /href="\/assets\/index-abc\.css"/);
    assert.match(output, new RegExp(`<title>${escapeRegex(escapeHtml(registerConfig.title))}</title>`));
    assert.match(
      output,
      new RegExp(`<link rel="canonical" href="${escapeRegex(registerConfig.canonicalUrl)}" />`)
    );
  });

  test('2. Built dist/ contains static HTML shells for all 9 public routes with route-specific metadata', () => {
    assert.ok(fs.existsSync(path.join(distDir, 'index.html')), 'dist/index.html must exist (run npm run build)');

    const seenTitles = new Set();
    const seenDescriptions = new Set();

    for (const route of PUBLIC_ROUTE_SEO_LIST) {
      const htmlPath =
        route.path === '/'
          ? path.join(distDir, 'index.html')
          : path.join(distDir, route.path.replace(/^\/+|\/+$/g, ''), 'index.html');

      assert.ok(fs.existsSync(htmlPath), `Generated HTML missing for ${route.path}: ${htmlPath}`);
      const html = fs.readFileSync(htmlPath, 'utf8');

      const expectedTitle = escapeHtml(route.title);
      const expectedDesc = escapeHtml(route.description);

      assert.equal(countMatches(html, /<title>/gi), 1, `${route.path} must have 1 <title>`);
      assert.equal(countMatches(html, /<meta\s+[^>]*name="description"/gi), 1, `${route.path} must have 1 description`);
      assert.equal(countMatches(html, /<link\s+[^>]*rel="canonical"/gi), 1, `${route.path} must have 1 canonical`);

      assert.ok(html.includes(`<title>${expectedTitle}</title>`), `${route.path} title mismatch`);
      assert.ok(
        html.includes(`<meta name="description" content="${expectedDesc}" />`),
        `${route.path} description mismatch`
      );
      assert.ok(
        html.includes(`<link rel="canonical" href="${route.canonicalUrl}" />`),
        `${route.path} canonical mismatch`
      );
      assert.ok(
        html.includes(`<meta property="og:title" content="${expectedTitle}" />`),
        `${route.path} og:title mismatch`
      );
      assert.ok(
        html.includes(`<meta property="og:description" content="${expectedDesc}" />`),
        `${route.path} og:description mismatch`
      );
      assert.ok(
        html.includes(`<meta property="og:url" content="${route.canonicalUrl}" />`),
        `${route.path} og:url mismatch`
      );
      assert.ok(
        html.includes(`<meta property="og:image" content="${route.ogImage}" />`),
        `${route.path} og:image mismatch`
      );
      assert.ok(
        html.includes('<meta name="twitter:card" content="summary_large_image" />'),
        `${route.path} twitter:card mismatch`
      );
      assert.ok(
        html.includes(`<meta name="twitter:title" content="${expectedTitle}" />`),
        `${route.path} twitter:title mismatch`
      );
      assert.ok(
        html.includes(`<meta name="twitter:description" content="${expectedDesc}" />`),
        `${route.path} twitter:description mismatch`
      );
      assert.ok(
        html.includes(`<meta name="twitter:url" content="${route.canonicalUrl}" />`),
        `${route.path} twitter:url mismatch`
      );
      assert.ok(
        html.includes(`<meta name="twitter:image" content="${route.ogImage}" />`),
        `${route.path} twitter:image mismatch`
      );
      assert.equal(countMatches(html, /property="twitter:/gi), 0, `${route.path} must not use property="twitter:*"`);
      assert.equal(countMatches(html, /<meta\s+[^>]*name="twitter:card"/gi), 1);
      assert.equal(countMatches(html, /<meta\s+[^>]*name="twitter:title"/gi), 1);
      assert.equal(countMatches(html, /<meta\s+[^>]*name="twitter:description"/gi), 1);
      assert.equal(countMatches(html, /<meta\s+[^>]*name="twitter:url"/gi), 1);
      assert.equal(countMatches(html, /<meta\s+[^>]*name="twitter:image"/gi), 1);

      // Verify root-relative Vite asset paths are preserved for nested routes
      assert.match(html, /src="\/assets\/[^"]+\.js"/, `${route.path} must reference /assets/*.js`);
      assert.match(html, /href="\/assets\/[^"]+\.css"/, `${route.path} must reference /assets/*.css`);

      // Verify no School JSON-LD was injected into static HTML (remains in React SEO.jsx)
      assert.equal(countMatches(html, /application\/ld\+json/gi), 0, `${route.path} should not duplicate JSON-LD`);

      seenTitles.add(route.title);
      seenDescriptions.add(route.description);
    }

    assert.equal(seenTitles.size, 9);
    assert.equal(seenDescriptions.size, 9);
  });

  test('3. No static HTML files are generated for admin, login, unauthorized, or 404 routes', () => {
    const forbiddenDirs = ['admin', 'login', 'unauthorized', '404'];
    for (const dir of forbiddenDirs) {
      assert.equal(
        fs.existsSync(path.join(distDir, dir)),
        false,
        `dist/${dir} must NOT be generated`
      );
    }
  });
});
