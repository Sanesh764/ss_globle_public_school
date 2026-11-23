import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { setupTestEnvironment, teardownTestEnvironment } from './test-helper.js';

describe('Test Category A: Login Validation Tests', () => {
  let baseUrl;

  before(async () => {
    const env = await setupTestEnvironment();
    baseUrl = env.baseUrl;
  });

  after(async () => {
    await teardownTestEnvironment();
  });

  const postLogin = async (body) => {
    const res = await fetch(`${baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  test('A1: Valid email format is accepted by validator', async () => {
    const { status } = await postLogin({
      email: 'valid.user@ssglobal.edu.in',
      password: 'SomePassword123!',
    });
    // Even if credentials do not exist in DB, it must pass validation (HTTP 401, not 400)
    assert.equal(status, 401, 'Expected 401 Unauthorized (passed validation)');
  });

  test('A2: Valid username format is accepted by validator (email field)', async () => {
    const { status } = await postLogin({
      email: 'validusername',
      password: 'SomePassword123!',
    });
    // Passes validation -> reaches controller -> 401 (not 400)
    assert.equal(status, 401, 'Expected 401 Unauthorized for valid username (passed validation)');
  });

  test('A3: Valid username passed under username field is accepted by validator', async () => {
    const { status } = await postLogin({
      username: 'admin_user-123',
      password: 'SomePassword123!',
    });
    assert.equal(status, 401, 'Expected 401 Unauthorized (passed validation)');
  });

  test('A4: Missing identifier (neither email nor username) is rejected with 400', async () => {
    const { status, data } = await postLogin({
      password: 'SomePassword123!',
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
    assert.match(data.message, /Please provide an email address or username/i);
  });

  test('A5: Missing password is rejected with 400', async () => {
    const { status, data } = await postLogin({
      email: 'test-admin@ssglobal.edu.in',
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
    assert.match(data.message, /Password is required/i);
  });

  test('A6: Empty identifier is rejected with 400', async () => {
    const { status, data } = await postLogin({
      email: '',
      password: 'SomePassword123!',
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
  });

  test('A7: Whitespace-only identifier is rejected with 400', async () => {
    const { status, data } = await postLogin({
      email: '    ',
      password: 'SomePassword123!',
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
    assert.match(data.message, /empty or whitespace only/i);
  });

  test('A8: Empty password is rejected with 400', async () => {
    const { status, data } = await postLogin({
      email: 'test-admin@ssglobal.edu.in',
      password: '',
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
  });

  test('A9: Whitespace-only password is rejected with 400', async () => {
    const { status, data } = await postLogin({
      email: 'test-admin@ssglobal.edu.in',
      password: '     ',
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
    assert.match(data.message, /empty or whitespace only/i);
  });

  test('A10: Invalid non-string identifier type is rejected with 400', async () => {
    const { status, data } = await postLogin({
      email: { $ne: null },
      password: 'SomePassword123!',
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
    assert.match(data.message, /text string/i);
  });

  test('A11: Invalid non-string password type is rejected with 400', async () => {
    const { status, data } = await postLogin({
      email: 'test-admin@ssglobal.edu.in',
      password: 12345678,
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
    assert.match(data.message, /text string/i);
  });

  test('A12: Oversized identifier (>100 characters) is rejected with 400', async () => {
    const { status, data } = await postLogin({
      email: `${'a'.repeat(95)}@test.com`, // 104 chars
      password: 'SomePassword123!',
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
    assert.match(data.message, /too long/i);
  });

  test('A13: Oversized password (>200 characters) is rejected with 400', async () => {
    const { status, data } = await postLogin({
      email: 'test-admin@ssglobal.edu.in',
      password: 'x'.repeat(201),
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
    assert.match(data.message, /too long/i);
  });

  test('A14: Malformed email containing @ but invalid syntax is rejected with 400', async () => {
    const { status, data } = await postLogin({
      email: 'invalid-email-syntax@',
      password: 'SomePassword123!',
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
    assert.match(data.message, /valid email address/i);
  });

  test('A15: Username with invalid characters (spaces) is rejected with 400', async () => {
    const { status, data } = await postLogin({
      username: 'user name with spaces',
      password: 'SomePassword123!',
    });
    assert.equal(status, 400);
    assert.equal(data.success, false);
    assert.match(data.message, /Username must contain only/i);
  });
});
