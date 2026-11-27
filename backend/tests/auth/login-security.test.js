import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { setupTestEnvironment, teardownTestEnvironment, TEST_USERS, TEST_JWT_SECRET } from './test-helper.js';

describe('Test Category C: Authentication Security Tests', () => {
  let baseUrl;
  let superadminToken;
  let staffToken;

  before(async () => {
    const env = await setupTestEnvironment();
    baseUrl = env.baseUrl;

    // Log in superadmin
    const saRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USERS.superadmin.email,
        password: TEST_USERS.superadmin.password,
      }),
    });
    const saData = await saRes.json();
    superadminToken = saData.data.token;

    // Log in staff
    const staffRes = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USERS.staff.email,
        password: TEST_USERS.staff.password,
      }),
    });
    const staffData = await staffRes.json();
    staffToken = staffData.data.token;
  });

  after(async () => {
    await teardownTestEnvironment();
  });

  test('C1: Password hash is never exposed in login response', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USERS.superadmin.email,
        password: TEST_USERS.superadmin.password,
      }),
    });
    const rawText = await res.text();
    assert.equal(rawText.includes('$2a$'), false, 'Password hash must not be in response text');
    assert.equal(rawText.includes('$2b$'), false, 'Password hash must not be in response text');
    assert.equal(rawText.includes('password'), false, 'Password field must not be in response text');
  });

  test('C2: Password hash is never exposed in profile response (GET /api/admin/me)', async () => {
    const res = await fetch(`${baseUrl}/api/admin/me`, {
      headers: { Authorization: `Bearer ${superadminToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.data.admin.password, undefined);
    const rawText = JSON.stringify(data);
    assert.equal(rawText.includes('$2a$'), false);
    assert.equal(rawText.includes('$2b$'), false);
  });

  test('C3: JWT token is signed with configured secret and decodes valid userId', () => {
    const decoded = jwt.verify(superadminToken, TEST_JWT_SECRET);
    assert.ok(decoded.userId, 'Token must contain userId');
    assert.ok(decoded.exp, 'Token must have expiration');
  });

  test('C4: Cookie contains HttpOnly flag and 24h max-age attribute', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USERS.superadmin.email,
        password: TEST_USERS.superadmin.password,
      }),
    });
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie);
    assert.match(setCookie, /HttpOnly/i, 'Cookie must be HttpOnly');
    assert.match(setCookie, /Max-Age=86400/i, 'Cookie max age must be 86400 seconds (24 hours)');
  });

  test('C5: Protected route rejects unauthenticated request with 401', async () => {
    const res = await fetch(`${baseUrl}/api/admin/me`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  test('C6: Protected route rejects request with tampered/invalid token with 401', async () => {
    const res = await fetch(`${baseUrl}/api/admin/me`, {
      headers: { Authorization: 'Bearer invalid.tampered.token' },
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /invalid|unauthorized/i);
  });

  test('C7: Protected route accepts valid authenticated Bearer token with 200', async () => {
    const res = await fetch(`${baseUrl}/api/admin/me`, {
      headers: { Authorization: `Bearer ${superadminToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.admin.email, TEST_USERS.superadmin.email);
  });

  test('C8: Superadmin-only route rejects staff role with HTTP 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /Super Admin permissions required/i);
  });

  test('C9: Superadmin-only route accepts superadmin role with HTTP 200', async () => {
    const res = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${superadminToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data.users));
  });
});
