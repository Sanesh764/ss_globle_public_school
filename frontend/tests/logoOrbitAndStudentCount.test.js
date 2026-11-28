import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

describe('Header Logo Orbit & Student Count Verification Tests', () => {
  test('1. Navbar wraps stationary school logo with two circular orbit rings and golden particles', () => {
    const navbar = fs.readFileSync(path.join(frontendRoot, 'src/components/common/Navbar.jsx'), 'utf8');
    assert.match(navbar, /logo-orbit-ring-outer/);
    assert.match(navbar, /logo-orbit-ring-inner/);
    assert.match(navbar, /logo-orbit-particle-outer/);
    assert.match(navbar, /logo-orbit-particle-inner/);
    assert.match(navbar, /alt="S\.S\. Global Public School Logo"/);
  });

  test('2. index.css defines 18s clockwise, 12s counter-clockwise orbit keyframes and reduced-motion disable rule', () => {
    const css = fs.readFileSync(path.join(frontendRoot, 'src/index.css'), 'utf8');
    assert.match(css, /@keyframes logo-orbit-cw/);
    assert.match(css, /@keyframes logo-orbit-ccw/);
    assert.match(css, /animation:\s*logo-orbit-cw 18s linear infinite/);
    assert.match(css, /animation:\s*logo-orbit-ccw 12s linear infinite/);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.logo-orbit-ring-outer,[\s\S]*\.logo-orbit-ring-inner[\s\S]*animation:\s*none !important/);
  });

  test('3. Student count is updated to 3,000+ and no 1,200+ enrollment references remain in src/', () => {
    const stats = fs.readFileSync(path.join(frontendRoot, 'src/components/home/StatsSection.jsx'), 'utf8');
    const aboutPreview = fs.readFileSync(path.join(frontendRoot, 'src/components/home/AboutPreview.jsx'), 'utf8');
    const aboutPage = fs.readFileSync(path.join(frontendRoot, 'src/pages/public/About.jsx'), 'utf8');

    assert.match(stats, /3,000\+/);
    assert.match(aboutPreview, /3,000\+/);
    assert.match(aboutPage, /3,000\+/);

    const checkNoLegacyCount = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkNoLegacyCount(full);
        } else {
          const content = fs.readFileSync(full, 'utf8');
          assert.equal(/1,?200\+/.test(content), false, `Outdated 1,200+ found in ${full}`);
        }
      }
    };

    checkNoLegacyCount(path.join(frontendRoot, 'src'));
  });
});
