import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSchoolSchema, SCHOOL_SCHEMA_ID, GOOGLE_MAPS_LISTING_URL } from '../src/utils/seoSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');

describe('Stage 1 SEO School Entity & JSON-LD Tests', () => {
  test('1. Produces a single valid School JSON-LD entity with verified address, coordinates, and CBSE/English metadata', () => {
    const schema = getSchoolSchema();
    assert.equal(schema['@context'], 'https://schema.org');
    assert.equal(schema['@type'], 'School');
    assert.equal(schema['@id'], SCHOOL_SCHEMA_ID);
    assert.equal(schema.name, 'S.S. Global Public School');
    assert.equal(schema.knowsLanguage, 'English');
    assert.match(schema.description, /CBSE-affiliated English medium school/);
    assert.equal(schema.memberOf, undefined);
    assert.deepEqual(schema.address, {
      '@type': 'PostalAddress',
      streetAddress: "Shambhu Nagar, Near Teacher's Training College",
      addressLocality: 'Daudnagar',
      addressRegion: 'Bihar',
      postalCode: '824143',
      addressCountry: 'IN',
    });
    assert.deepEqual(schema.geo, {
      '@type': 'GeoCoordinates',
      latitude: 25.0235988,
      longitude: 84.4291671,
    });
    assert.equal(schema.hasMap, GOOGLE_MAPS_LISTING_URL);
    assert.deepEqual(
      schema.areaServed.map((a) => a.name),
      ['Daudnagar', 'Aurangabad District, Bihar']
    );
  });

  test('2. Omits @context when embedded inside ContactPage.mainEntity', () => {
    const embedded = getSchoolSchema({ includeContext: false });
    assert.equal(embedded['@context'], undefined);
    assert.equal(embedded['@id'], SCHOOL_SCHEMA_ID);
  });

  test('3. index.html no longer contains duplicate static JSON-LD script', () => {
    const html = fs.readFileSync(path.join(frontendRoot, 'index.html'), 'utf8');
    assert.equal(html.includes('application/ld+json'), false);
  });
});
