import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

const readSource = (relativePath) =>
  fs.readFileSync(path.join(frontendRoot, relativePath), 'utf8');

describe('Homepage Student Registration Section Tests', () => {
  const sectionSource = readSource('src/components/home/StudentRegistrationSection.jsx');
  const homeSource = readSource('src/pages/public/Home.jsx');
  const heroSliderSource = readSource('src/components/home/HeroSlider.jsx');
  const routesSource = readSource('src/routes/AppRoutes.jsx');

  test('1-4. StudentRegistrationSection defines expected heading, description, supporting text, and Fill Student Details CTA', () => {
    assert.match(sectionSource, /Student Registration Made Easy/);
    assert.match(
      sectionSource,
      /Looking to join S\.S\. Global Public School\? Fill in the student details through our online registration form and submit your application for admission\./
    );
    assert.match(sectionSource, /Fill Student Details/);
    assert.match(
      sectionSource,
      /Complete the online form to begin your admission process\./
    );
  });

  test('5. Primary CTA navigates to /register using react-router-dom Link', () => {
    assert.match(sectionSource, /import \{ Link \} from 'react-router-dom'/);
    assert.match(sectionSource, /ctaPath:\s*'\/register'/);
    assert.match(sectionSource, /<Link[\s\S]*to=\{STUDENT_REGISTRATION_SECTION_CONTENT\.ctaPath\}/);
  });

  test('6-8. Home.jsx places StudentRegistrationSection immediately below HeroSection and preserves existing homepage sections', () => {
    const heroIdx = homeSource.indexOf('<HeroSection />');
    const regIdx = homeSource.indexOf('<StudentRegistrationSection />');
    const indIdx = homeSource.indexOf('<IndependenceDaySection />');
    const welcomeIdx = homeSource.indexOf('<WelcomeMessage />');
    const ctaIdx = homeSource.indexOf('<CallToAction />');

    assert.notEqual(heroIdx, -1);
    assert.notEqual(regIdx, -1);
    assert.ok(regIdx > heroIdx, 'StudentRegistrationSection must appear after HeroSection');
    assert.ok(regIdx < indIdx, 'StudentRegistrationSection must appear immediately below HeroSection');
    assert.ok(welcomeIdx !== -1 && ctaIdx !== -1);
  });

  test('9. Existing HeroSlider primary/secondary CTAs and /register public registration route remain intact', () => {
    assert.match(heroSliderSource, /slide\.primaryButtonText/);
    assert.match(heroSliderSource, /slide\.primaryButtonLink/);
    assert.match(heroSliderSource, /slide\.secondaryButtonText/);
    assert.match(routesSource, /path="register"/);
    assert.match(routesSource, /StudentRegistration/);
  });
});
