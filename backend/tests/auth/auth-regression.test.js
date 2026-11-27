import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment, teardownTestEnvironment, TEST_USERS } from './test-helper.js';

describe('Test Category D: Authentication Regression Tests', () => {
  let baseUrl;
  let superadminToken;
  let superadminCookie;

  before(async () => {
    const env = await setupTestEnvironment();
    baseUrl = env.baseUrl;

    // Perform initial login
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USERS.superadmin.email,
        password: TEST_USERS.superadmin.password,
      }),
    });
    const data = await res.json();
    superadminToken = data.data.token;
    const rawCookie = res.headers.get('set-cookie');
    superadminCookie = rawCookie ? rawCookie.split(';')[0] : '';
  });

  after(async () => {
    await teardownTestEnvironment();
  });

  test('D1: Admin session persistence via Bearer authorization header', async () => {
    const res = await fetch(`${baseUrl}/api/admin/me`, {
      headers: { Authorization: `Bearer ${superadminToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.admin.email, TEST_USERS.superadmin.email);
  });

  test('D2: Admin session persistence via HTTP cookie', async () => {
    const res = await fetch(`${baseUrl}/api/admin/me`, {
      headers: { Cookie: superadminCookie },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.admin.email, TEST_USERS.superadmin.email);
  });

  test('D3: Admin logout clears jwt cookie and invalidates session on client', async () => {
    const res = await fetch(`${baseUrl}/api/admin/logout`, {
      method: 'POST',
      headers: { Cookie: superadminCookie },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);

    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie);
    assert.match(setCookie, /jwt=;/);
    assert.match(setCookie, /Expires=Thu, 01 Jan 1970/i);
  });

  test('D4: Safe logout does not fail even if unauthenticated', async () => {
    const res = await fetch(`${baseUrl}/api/admin/logout`, {
      method: 'POST',
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
  });

  test('D5: SuperAdmin profile retrieval works seamlessly', async () => {
    const res = await fetch(`${baseUrl}/api/admin/profile`, {
      headers: { Authorization: `Bearer ${superadminToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.profile.email, TEST_USERS.superadmin.email);
  });

  test('D6: Staff user cannot access SuperAdmin profile endpoint', async () => {
    // Login as staff
    const staffLoginRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USERS.staff.email,
        password: TEST_USERS.staff.password,
      }),
    });
    const staffData = await staffLoginRes.json();
    const staffToken = staffData.data.token;

    const res = await fetch(`${baseUrl}/api/admin/profile`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert.equal(res.status, 403);
  });
});
