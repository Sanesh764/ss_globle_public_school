import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

const readSource = (relPath) => fs.readFileSync(path.join(frontendRoot, relPath), 'utf8');

describe('Stage 5 Admin, Unauthorized & Sitemap Indexing Tests', () => {
  test('1. AdminLayout, AdminLogin, Unauthorized, and NotFound all apply noindex={true}', () => {
    for (const file of [
      'src/layouts/AdminLayout.jsx',
      'src/pages/admin/AdminLogin.jsx',
      'src/pages/public/Unauthorized.jsx',
      'src/pages/public/NotFound.jsx',
    ]) {
      const src = readSource(file);
      assert.match(src, /<SEO[\s\S]*noindex=\{true\}/, `${file} must enforce noindex={true}`);
    }
  });

  test('2. SEO.jsx emits noindex, nofollow when noindex={true} and index, follow when false', () => {
    const seo = readSource('src/components/common/SEO.jsx');
    assert.match(seo, /'noindex, nofollow'/);
    assert.match(seo, /'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'/);
  });

  test('3. Indexable public pages remain indexable (do not set noindex={true})', () => {
    const publicPages = [
      'src/pages/public/Home.jsx',
      'src/pages/public/About.jsx',
      'src/pages/public/Facilities.jsx',
      'src/pages/public/Gallery.jsx',
      'src/pages/public/VideoGallery.jsx',
      'src/pages/public/NoticeBoard.jsx',
      'src/pages/public/Downloads.jsx',
      'src/pages/public/Contact.jsx',
      'src/pages/public/StudentRegistration.jsx',
    ];
    for (const file of publicPages) {
      const src = readSource(file);
      assert.equal(/noindex=\{true\}/.test(src), false, `${file} must remain indexable`);
    }
  });

  test('4. sitemap.xml contains exactly the 9 public URLs and excludes admin/unauthorized/404/api', () => {
    const sitemap = readSource('public/sitemap.xml');
    const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

    assert.deepEqual(locs, [
      'https://www.ssglobalpublicschool.com/',
      'https://www.ssglobalpublicschool.com/about',
      'https://www.ssglobalpublicschool.com/facilities',
      'https://www.ssglobalpublicschool.com/gallery',
      'https://www.ssglobalpublicschool.com/videos',
      'https://www.ssglobalpublicschool.com/notices',
      'https://www.ssglobalpublicschool.com/downloads',
      'https://www.ssglobalpublicschool.com/contact',
      'https://www.ssglobalpublicschool.com/register',
    ]);

    for (const loc of locs) {
      assert.equal(/\/admin|\/unauthorized|\/404|\/api/.test(loc), false);
    }
  });

  test('5. robots.txt declares Sitemap and blocks /api/ while allowing /admin crawl so noindex can be read', () => {
    const robots = readSource('public/robots.txt');
    assert.match(robots, /^Allow: \/$/m);
    assert.equal(/^Disallow:\s*\/admin/m.test(robots), false);
    assert.match(robots, /^Disallow: \/api\/$/m);
    assert.match(robots, /^Sitemap: https:\/\/www\.ssglobalpublicschool\.com\/sitemap\.xml$/m);
  });
});
