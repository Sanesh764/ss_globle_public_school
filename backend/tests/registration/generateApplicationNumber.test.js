import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import generateApplicationNumber from '../../src/utils/generateApplicationNumber.js';

const getExpectedIndiaYear = (date = new Date()) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
  }).format(date);

describe('generateApplicationNumber Utility Tests', () => {
  test('1. Generates reference number matching SSG-YYYY-XXXXXXXXXXXXXXXX (8-byte hex) format', () => {
    const appNum = generateApplicationNumber();
    const expectedYear = getExpectedIndiaYear();
    const pattern = new RegExp(`^SSG-${expectedYear}-[0-9A-F]{16}$`);

    assert.match(appNum, pattern);
    assert.equal(appNum.length, 25);
  });

  test('2. Derives year dynamically using Asia/Kolkata timezone and handles year boundaries', () => {
    // 2026-12-31 18:29:59 UTC is 2026-12-31 23:59:59 IST -> 2026
    const beforeMidnightIst = new Date('2026-12-31T18:29:59.000Z');
    assert.match(generateApplicationNumber(beforeMidnightIst), /^SSG-2026-[0-9A-F]{16}$/);

    // 2026-12-31 18:30:00 UTC is 2027-01-01 00:00:00 IST -> 2027
    const atMidnightIst = new Date('2026-12-31T18:30:00.000Z');
    assert.match(generateApplicationNumber(atMidnightIst), /^SSG-2027-[0-9A-F]{16}$/);
  });

  test('3. Produces 1,000 distinct outputs across repeated calls', () => {
    const sampleSize = 1000;
    const generated = new Set();

    for (let i = 0; i < sampleSize; i++) {
      generated.add(generateApplicationNumber());
    }

    assert.equal(generated.size, sampleSize);
  });

  test('4. Uses only valid uppercase hexadecimal characters and hyphens with 16-char suffix', () => {
    for (let i = 0; i < 50; i++) {
      const appNum = generateApplicationNumber();
      assert.match(appNum, /^SSG-\d{4}-[0-9A-F]{16}$/);
      assert.equal(appNum.length, 25);
    }
  });

  test('5. Ignores personal information and never embeds PII', () => {
    const fakePersonalPayload = {
      fullName: 'Aarav Sharma',
      contactNumber: '9876543210',
      dateOfBirth: '2014-08-19',
    };
    const appNum = generateApplicationNumber(fakePersonalPayload);

    assert.match(appNum, /^SSG-\d{4}-[0-9A-F]{16}$/);
    assert.equal(appNum.includes('Aarav'), false);
    assert.equal(appNum.includes('9876543210'), false);
    assert.equal(appNum.includes('2014'), false);
  });
});
