import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment, teardownTestEnvironment, TEST_USERS } from './test-helper.js';

describe('Test Category B: Login Integration Tests', () => {
  let baseUrl;

  before(async () => {
    const env = await setupTestEnvironment();
    baseUrl = env.baseUrl;
  });

  after(async () => {
    await teardownTestEnvironment();
  });

  test('B1: Successful login using valid admin email + correct password', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USERS.superadmin.email,
        password: TEST_USERS.superadmin.password,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();

    assert.equal(data.success, true);
    assert.equal(data.statusCode, 200);
    assert.ok(data.data.token, 'Token must be returned');
    assert.equal(data.data.admin.email, TEST_USERS.superadmin.email);
    assert.equal(data.data.admin.role, 'superadmin');
    assert.equal(data.data.admin.isActive, true);

    // Verify Set-Cookie header contains HttpOnly jwt cookie
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie, 'Set-Cookie header must be present');
    assert.match(setCookie, /jwt=/);
    assert.match(setCookie, /HttpOnly/i);
  });

  test('B2: Successful login using valid admin username (in email field)', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USERS.superadmin.username,
        password: TEST_USERS.superadmin.password,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();

    assert.equal(data.success, true);
    assert.ok(data.data.token);
    assert.equal(data.data.admin.username, TEST_USERS.superadmin.username);
    assert.equal(data.data.admin.email, TEST_USERS.superadmin.email);
  });

  test('B3: Successful login using valid admin username (in username field)', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: TEST_USERS.superadmin.username,
        password: TEST_USERS.superadmin.password,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();

    assert.equal(data.success, true);
    assert.ok(data.data.token);
    assert.equal(data.data.admin.username, TEST_USERS.superadmin.username);
  });

  test('B4: Successful login for staff role using staff email and password', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USERS.staff.email,
        password: TEST_USERS.staff.password,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.admin.role, 'staff');
  });

  test('B5: Successful login for staff role using staff username', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: TEST_USERS.staff.username,
        password: TEST_USERS.staff.password,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.admin.username, TEST_USERS.staff.username);
    assert.equal(data.data.admin.role, 'staff');
  });

  test('B6: Login with incorrect password returns HTTP 401', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USERS.superadmin.email,
        password: 'WrongPassword123!',
      }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /Invalid email or password credentials/i);
  });

  test('B7: Login with unknown email returns HTTP 401 with generic error message', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'unknown-nonexistent-user@ssglobal.edu.in',
        password: 'SomePassword123!',
      }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /Invalid email or password credentials/i);
  });

  test('B8: Login with unknown username returns HTTP 401 with generic error message', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'nonexistentuser',
        password: 'SomePassword123!',
      }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /Invalid email or password credentials/i);
  });

  test('B9: Inactive admin account login returns HTTP 403', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USERS.inactive.email,
        password: TEST_USERS.inactive.password,
      }),
    });

    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /deactivated/i);
  });

  test('B10: Case-insensitivity and whitespace trimming for identifier', async () => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `  ${TEST_USERS.superadmin.username.toUpperCase()}  `,
        password: TEST_USERS.superadmin.password,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.admin.email, TEST_USERS.superadmin.email);
  });
});
