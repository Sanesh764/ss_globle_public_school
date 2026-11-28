import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_ROUTE_SEO } from '../src/utils/seoRoutesConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

describe('Stage 4 Registration Page Indexing Tests', () => {
  test('1. /register is publicly routed outside ProtectedRoute in AppRoutes.jsx', () => {
    const routes = fs.readFileSync(path.join(frontendRoot, 'src/routes/AppRoutes.jsx'), 'utf8');
    const mainLayoutBlock = routes.match(/<Route path="\/" element=\{<MainLayout \/>\}>[\s\S]*?<\/Route>/);
    assert.ok(mainLayoutBlock, 'MainLayout route block must exist');
    assert.match(mainLayoutBlock[0], /<Route path="register" element=\{<SuspenseWrapper><StudentRegistration \/><\/SuspenseWrapper>\} \/>/);
  });

  test('2. StudentRegistration.jsx is indexable with canonicalUrl /register and H1', () => {
    const reg = fs.readFileSync(path.join(frontendRoot, 'src/pages/public/StudentRegistration.jsx'), 'utf8');
    assert.equal(
      PUBLIC_ROUTE_SEO['/register'].canonicalUrl,
      'https://www.ssglobalpublicschool.com/register'
    );
    assert.match(reg, /canonicalUrl=\{PUBLIC_ROUTE_SEO\['\/register'\]\.canonicalUrl\}/);
    assert.equal(/noindex=\{true\}/.test(reg), false);
    assert.match(reg, /<PageHeader[\s\S]*title="Student Self-Registration"/);
  });

  test('3. sitemap.xml includes /register and robots.txt does not block /register', () => {
    const sitemap = fs.readFileSync(path.join(frontendRoot, 'public/sitemap.xml'), 'utf8');
    const robots = fs.readFileSync(path.join(frontendRoot, 'public/robots.txt'), 'utf8');

    assert.match(sitemap, /<loc>https:\/\/www\.ssglobalpublicschool\.com\/register<\/loc>/);
    assert.equal(/Disallow:\s*\/register/i.test(robots), false);
  });
});
