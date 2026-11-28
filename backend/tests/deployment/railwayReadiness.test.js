import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from '../../src/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');

describe('Railway Production Readiness Tests', () => {
  let server;
  let baseUrl;

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1. GET / reports server running cleanly with HTTP 200', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'success');
  });

  test('2. GET /api/health distinguishes DB readiness without leaking internal diagnostics', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.status, 'DEGRADED');
    assert.equal(body.database, 'disconnected');
    assert.equal(body.mongoUri, undefined);
  });

  test('3. CORS allows production frontend origin and blocks unknown origins with 403', async () => {
    const allowedRes = await fetch(`${baseUrl}/`, {
      headers: { Origin: 'https://www.ssglobalpublicschool.com' },
    });
    assert.equal(allowedRes.status, 200);
    assert.equal(
      allowedRes.headers.get('access-control-allow-origin'),
      'https://www.ssglobalpublicschool.com'
    );
    assert.equal(allowedRes.headers.get('access-control-allow-credentials'), 'true');

    const blockedRes = await fetch(`${baseUrl}/`, {
      headers: { Origin: 'https://evil-untrusted-site.example' },
    });
    assert.equal(blockedRes.status, 403);
  });

  test('4. server.js fails fast when JWT_SECRET or MONGO_URI is missing', () => {
    const serverPath = path.join(backendRoot, 'server.js');
    const emptyCwd = os.tmpdir();

    assert.throws(
      () =>
        execFileSync(process.execPath, [serverPath], {
          cwd: emptyCwd,
          timeout: 5000,
          env: {
            PATH: process.env.PATH,
            NODE_ENV: 'production',
          },
          stdio: 'pipe',
        }),
      (err) => err.status === 1
    );

    assert.throws(
      () =>
        execFileSync(process.execPath, [serverPath], {
          cwd: emptyCwd,
          timeout: 5000,
          env: {
            PATH: process.env.PATH,
            NODE_ENV: 'production',
            JWT_SECRET: 'a_very_secure_non_placeholder_test_secret_2026',
            MONGO_URI: '',
          },
          stdio: 'pipe',
        }),
      (err) => err.status === 1
    );

    assert.throws(
      () =>
        execFileSync(process.execPath, [serverPath], {
          cwd: emptyCwd,
          timeout: 5000,
          env: {
            PATH: process.env.PATH,
            NODE_ENV: 'production',
            JWT_SECRET: 'a_very_secure_non_placeholder_test_secret_2026',
            MONGO_URI: 'mongodb+srv://user:pass@cluster.example.mongodb.net/db',
          },
          stdio: 'pipe',
        }),
      (err) => err.status === 1
    );
  });
});
