import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  studentPhotoUpload,
  cleanupTempUploadedFile,
  STUDENT_PHOTO_MAX_SIZE,
} from '../../src/middleware/uploadMiddleware.js';
import { errorHandler } from '../../src/middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

const JPEG_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const PNG_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
const WEBP_BYTES = Buffer.concat([
  Buffer.from('RIFF', 'ascii'),
  Buffer.from([0x24, 0x00, 0x00, 0x00]),
  Buffer.from('WEBP', 'ascii'),
  Buffer.from('VP8 ', 'ascii'),
]);

let server;
let baseUrl;
const createdTempFiles = [];

describe('studentPhotoUpload Middleware Tests', () => {
  before(async () => {
    process.env.NODE_ENV = 'test';
    const app = express();
    app.use(express.json());
    app.post('/test-upload', studentPhotoUpload, (req, res) => {
      if (req.file?.path) {
        createdTempFiles.push(req.file.path);
      }
      res.status(200).json({
        success: true,
        hasFile: Boolean(req.file),
        filename: req.file?.filename || null,
        fullName: req.body?.fullName || null,
      });
    });
    app.use(errorHandler);

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterEach(async () => {
    while (createdTempFiles.length > 0) {
      const filePath = createdTempFiles.pop();
      await cleanupTempUploadedFile(filePath).catch(() => {});
    }
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  const postMultipart = async (files = [], fields = { fullName: 'Aarav Sharma' }) => {
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) {
      form.append(k, v);
    }
    for (const f of files) {
      const blob = new Blob([f.bytes], { type: f.mime });
      form.append(f.fieldName || 'photo', blob, f.filename);
    }
    return fetch(`${baseUrl}/test-upload`, {
      method: 'POST',
      body: form,
    });
  };

  test('1. Accepts valid JPEG photograph', async () => {
    const res = await postMultipart([{ bytes: JPEG_BYTES, mime: 'image/jpeg', filename: 'student.jpg' }]);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.hasFile, true);
    assert.match(body.filename, /^student-photo-.*\.jpg$/);
  });

  test('2. Accepts valid PNG photograph', async () => {
    const res = await postMultipart([{ bytes: PNG_BYTES, mime: 'image/png', filename: 'student.png' }]);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.hasFile, true);
    assert.match(body.filename, /^student-photo-.*\.png$/);
  });

  test('3. Accepts valid WebP photograph', async () => {
    const res = await postMultipart([{ bytes: WEBP_BYTES, mime: 'image/webp', filename: 'student.webp' }]);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.hasFile, true);
    assert.match(body.filename, /^student-photo-.*\.webp$/);
  });

  test('4. Allows missing photo for both JSON and multipart/form-data requests', async () => {
    const jsonRes = await fetch(`${baseUrl}/test-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Aarav Sharma' }),
    });
    assert.equal(jsonRes.status, 200);
    const jsonBody = await jsonRes.json();
    assert.equal(jsonBody.hasFile, false);
    assert.equal(jsonBody.fullName, 'Aarav Sharma');

    const formRes = await postMultipart([]);
    assert.equal(formRes.status, 200);
    const formBody = await formRes.json();
    assert.equal(formBody.hasFile, false);
    assert.equal(formBody.fullName, 'Aarav Sharma');
  });

  test('5. Rejects SVG upload with HTTP 400', async () => {
    const svgBytes = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const res = await postMultipart([{ bytes: svgBytes, mime: 'image/svg+xml', filename: 'xss.svg' }]);
    assert.equal(res.status, 400);
  });

  test('6. Rejects GIF upload with HTTP 400', async () => {
    const gifBytes = Buffer.from('GIF89a\x01\x00\x01\x00');
    const res = await postMultipart([{ bytes: gifBytes, mime: 'image/gif', filename: 'anim.gif' }]);
    assert.equal(res.status, 400);
  });

  test('7. Rejects PDF upload with HTTP 400', async () => {
    const pdfBytes = Buffer.from('%PDF-1.4\n%test');
    const res = await postMultipart([{ bytes: pdfBytes, mime: 'application/pdf', filename: 'doc.pdf' }]);
    assert.equal(res.status, 400);
  });

  test('8. Rejects fake JPEG extension with invalid binary contents', async () => {
    const fakeBytes = Buffer.from('MZ\x90\x00not-a-real-jpeg');
    const res = await postMultipart([{ bytes: fakeBytes, mime: 'image/jpeg', filename: 'malware.jpg' }]);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /Invalid image file signature/i);
  });

  test('9. Rejects MIME and extension mismatch', async () => {
    const res = await postMultipart([{ bytes: PNG_BYTES, mime: 'image/png', filename: 'spoofed.jpg' }]);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /does not match/i);
  });

  test('10. Rejects file larger than 2 MB with HTTP 400', async () => {
    const oversized = Buffer.concat([JPEG_BYTES, Buffer.alloc(STUDENT_PHOTO_MAX_SIZE + 1024)]);
    const res = await postMultipart([{ bytes: oversized, mime: 'image/jpeg', filename: 'large.jpg' }]);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /2 MB/i);
  });

  test('11. Rejects unexpected file field name with HTTP 400', async () => {
    const res = await postMultipart([
      { fieldName: 'avatar', bytes: JPEG_BYTES, mime: 'image/jpeg', filename: 'student.jpg' },
    ]);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /photo/i);
  });

  test('12. Rejects more than one uploaded photo with HTTP 400', async () => {
    const res = await postMultipart([
      { fieldName: 'photo', bytes: JPEG_BYTES, mime: 'image/jpeg', filename: 'one.jpg' },
      { fieldName: 'photo', bytes: PNG_BYTES, mime: 'image/png', filename: 'two.png' },
    ]);
    assert.equal(res.status, 400);
  });

  test('13. Cleans up temporary file from uploads directory after signature rejection', async () => {
    const beforeFiles = new Set(fs.readdirSync(uploadsDir));
    const fakeBytes = Buffer.from('NOT_A_REAL_PNG_FILE');

    const res = await postMultipart([{ bytes: fakeBytes, mime: 'image/png', filename: 'fake.png' }]);
    assert.equal(res.status, 400);

    const afterFiles = fs.readdirSync(uploadsDir);
    const leaked = afterFiles.filter((f) => !beforeFiles.has(f) && f.startsWith('student-photo-'));
    assert.deepEqual(leaked, []);
  });

  test('14. cleanupTempUploadedFile handles missing files and empty inputs safely', async () => {
    const nonExistent = path.join(uploadsDir, 'student-photo-does-not-exist-999999.jpg');
    const resultMissing = await cleanupTempUploadedFile(nonExistent);
    assert.equal(resultMissing, false);

    const resultNull = await cleanupTempUploadedFile(null);
    assert.equal(resultNull, false);

    // Safety guard: refuses to delete files outside uploadsDir
    const outsideResult = await cleanupTempUploadedFile(path.resolve(uploadsDir, '../package.json'));
    assert.equal(outsideResult, false);
  });
});
