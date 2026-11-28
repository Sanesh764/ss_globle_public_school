import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from '../../src/app.js';
import StudentApplication from '../../src/models/StudentApplication.js';
import { cloudinary } from '../../src/config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

const JPEG_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

let server;
let baseUrl;
const originalCreate = StudentApplication.create.bind(StudentApplication);
const originalCloudinaryUpload = cloudinary.uploader.upload;
const originalCloudinaryDestroy = cloudinary.uploader.destroy;
const originalCloudinaryEnv = {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

const validPayload = (overrides = {}) => ({
  fullName: '  Aarav Sharma  ',
  dateOfBirth: '2015-06-15',
  gender: 'Male',
  fatherName: '  Vikram Sharma  ',
  motherName: '  Priya Sharma  ',
  contactNumber: '9876543210',
  classApplyingFor: 'Class 5',
  ...overrides,
});

describe('POST /api/registrations - Public Student Registration API', () => {
  before(async () => {
    process.env.NODE_ENV = 'test';
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterEach(() => {
    StudentApplication.create = originalCreate;
    cloudinary.uploader.upload = originalCloudinaryUpload;
    cloudinary.uploader.destroy = originalCloudinaryDestroy;
    process.env.CLOUDINARY_CLOUD_NAME = originalCloudinaryEnv.CLOUDINARY_CLOUD_NAME;
    process.env.CLOUDINARY_API_KEY = originalCloudinaryEnv.CLOUDINARY_API_KEY;
    process.env.CLOUDINARY_API_SECRET = originalCloudinaryEnv.CLOUDINARY_API_SECRET;
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1. Submits valid registration without auth, generates SSG-YYYY-... number, forces Pending status, and returns 201', async () => {
    let savedDoc = null;
    StudentApplication.create = async (doc) => {
      savedDoc = doc;
      return {
        _id: '65f1a2b3c4d5e6f7a8b9c0d1',
        ...doc,
        createdAt: new Date('2026-11-28T06:00:00.000Z'),
      };
    };

    const res = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload({ email: '  Parent@Example.COM  ' })),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.statusCode, 201);
    assert.match(body.data.application.applicationNumber, /^SSG-\d{4}-[0-9A-F]{16}$/);
    assert.equal(body.data.application.status, 'Pending');
    assert.equal(body.data.application.fullName, 'Aarav Sharma');
    assert.equal(body.data.application.classApplyingFor, 'Class 5');

    assert.equal(savedDoc.status, 'Pending');
    assert.equal(savedDoc.contactNumber, '9876543210');
    assert.equal(savedDoc.email, 'parent@example.com');
    assert.equal(savedDoc.reviewHistory[0].action, 'SUBMITTED');
    assert.equal(savedDoc.reviewHistory[0].actorType, 'Applicant');
  });

  test('2. Rejects unexpected or disallowed fields with 400', async () => {
    const disallowedPayloads = [
      validPayload({ status: 'Approved' }),
      validPayload({ applicationNumber: 'SSG-2026-CUSTOM1234' }),
      validPayload({ previousSchoolName: 'ABC School' }),
      validPayload({ guardianName: 'Uncle' }),
      validPayload({ alternateContactNumber: '9999999999' }),
      validPayload({ address: 'Daudnagar' }),
      validPayload({ reviewNotes: 'Auto approved' }),
    ];

    for (const payload of disallowedPayloads) {
      const res = await fetch(`${baseUrl}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /Unexpected field/i);
    }
  });

  test('3. Rejects missing required fields, blank strings, invalid class, invalid gender, and malformed email', async () => {
    const invalidCases = [
      validPayload({ fullName: '   ' }),
      validPayload({ fatherName: '' }),
      validPayload({ motherName: '  ' }),
      validPayload({ contactNumber: 9876543210 }),
      validPayload({ classApplyingFor: 'Class 13' }),
      validPayload({ gender: 'Unknown' }),
      validPayload({ email: 'not-an-email' }),
    ];

    for (const payload of invalidCases) {
      const res = await fetch(`${baseUrl}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
    }
  });

  test('4. Rejects invalid or future dateOfBirth according to Asia/Kolkata calendar date', async () => {
    const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    for (const badDob of ['not-a-date', '   ', futureDate]) {
      const res = await fetch(`${baseUrl}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload({ dateOfBirth: badDob })),
      });
      assert.equal(res.status, 400);
    }
  });

  test('5. Retries on applicationNumber duplicate-key error 11000 and succeeds within 3 retries', async () => {
    let attempts = 0;
    const seenNumbers = [];

    StudentApplication.create = async (doc) => {
      attempts += 1;
      seenNumbers.push(doc.applicationNumber);
      if (attempts <= 2) {
        const dupErr = new Error('E11000 duplicate key error collection: applicationNumber');
        dupErr.code = 11000;
        dupErr.keyPattern = { applicationNumber: 1 };
        throw dupErr;
      }
      return { _id: '65f1a2b3c4d5e6f7a8b9c0d2', ...doc, createdAt: new Date() };
    };

    const res = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload()),
    });

    assert.equal(res.status, 201);
    assert.equal(attempts, 3);
    assert.equal(new Set(seenNumbers).size, 3);
  });

  test('6. Stops after 3 retries on persistent applicationNumber 11000 collision and returns 500', async () => {
    let attempts = 0;
    StudentApplication.create = async () => {
      attempts += 1;
      const dupErr = new Error('E11000 duplicate key error collection: applicationNumber');
      dupErr.code = 11000;
      dupErr.keyPattern = { applicationNumber: 1 };
      throw dupErr;
    };

    const res = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload()),
    });

    assert.equal(res.status, 500);
    assert.equal(attempts, 4); // 1 initial + 3 retries
    const body = await res.json();
    assert.equal(body.success, false);
  });

  test('7. Does not retry unrelated database errors', async () => {
    let attempts = 0;
    StudentApplication.create = async () => {
      attempts += 1;
      throw new Error('Database connection lost');
    };

    const res = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload()),
    });

    assert.equal(res.status, 500);
    assert.equal(attempts, 1);
  });

  test('8. Accepts valid Indian mobile formats (+91 and formatted) and normalizes consistently as String', async () => {
    const validPhones = ['6123456789', '+91 98765 43210', '(+91) 88765-43210', '78765-43210'];

    for (const phone of validPhones) {
      let savedDoc = null;
      StudentApplication.create = async (doc) => {
        savedDoc = doc;
        return { _id: '65f1a2b3c4d5e6f7a8b9c0d3', ...doc, createdAt: new Date() };
      };

      const res = await fetch(`${baseUrl}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload({ contactNumber: phone })),
      });

      assert.equal(res.status, 201, `Expected 201 for phone "${phone}"`);
      assert.equal(typeof savedDoc.contactNumber, 'string');
      assert.match(savedDoc.contactNumber, /^[6-9]\d{9}$/);
    }
  });

  test('9. Rejects invalid mobile lengths, prefixes, and characters', async () => {
    const invalidPhones = ['987654321', '98765432101', '5876543210', '0987654321', '98765abc10', '+1 9876543210'];

    for (const phone of invalidPhones) {
      const res = await fetch(`${baseUrl}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPayload({ contactNumber: phone })),
      });
      assert.equal(res.status, 400, `Expected 400 for invalid phone "${phone}"`);
    }
  });

  test('10. Enforces name length boundaries (2 to 100 chars) across fullName, fatherName, motherName', async () => {
    StudentApplication.create = async (doc) => ({
      _id: '65f1a2b3c4d5e6f7a8b9c0d4',
      ...doc,
      createdAt: new Date(),
    });

    // Minimum valid boundary (2 chars) and maximum valid boundary (100 chars)
    const minValidRes = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload({ fullName: 'Om', fatherName: 'A'.repeat(100) })),
    });
    assert.equal(minValidRes.status, 201);

    // Invalid boundaries (1 char and 101 chars)
    for (const field of ['fullName', 'fatherName', 'motherName']) {
      for (const badVal of ['A', 'A'.repeat(101)]) {
        const res = await fetch(`${baseUrl}/api/registrations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validPayload({ [field]: badVal })),
        });
        assert.equal(res.status, 400, `Expected 400 for ${field} length ${badVal.length}`);
      }
    }
  });

  test('11. Preserves Gmail dots and plus-addressing while lowercasing and trimming optional email', async () => {
    let savedDoc = null;
    StudentApplication.create = async (doc) => {
      savedDoc = doc;
      return { _id: '65f1a2b3c4d5e6f7a8b9c0d5', ...doc, createdAt: new Date() };
    };

    const res = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload({ email: '  Sanesh.Gupta+School@gmail.com  ' })),
    });

    assert.equal(res.status, 201);
    assert.equal(savedDoc.email, 'sanesh.gupta+school@gmail.com');

    // Empty optional email should also be accepted and omitted
    const emptyEmailRes = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload({ email: '' })),
    });
    assert.equal(emptyEmailRes.status, 201);
    assert.equal(savedDoc.email, undefined);
  });

  test('12. Multipart submission with valid photo uploads to Cloudinary once, saves URL/public_id, and returns standard 201', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
    process.env.CLOUDINARY_API_KEY = 'test_key';
    process.env.CLOUDINARY_API_SECRET = 'test_secret';

    let uploadCalls = 0;
    let savedDoc = null;

    cloudinary.uploader.upload = async () => {
      uploadCalls += 1;
      return {
        secure_url: 'https://res.cloudinary.com/test_cloud/image/upload/v1/ss_global_school/student_applications/stu_01.jpg',
        public_id: 'ss_global_school/student_applications/stu_01',
      };
    };
    StudentApplication.create = async (doc) => {
      savedDoc = doc;
      return { _id: '65f1a2b3c4d5e6f7a8b9c0d6', ...doc, createdAt: new Date() };
    };

    const form = new FormData();
    for (const [k, v] of Object.entries(validPayload())) {
      form.append(k, v);
    }
    form.append('photo', new Blob([JPEG_BYTES], { type: 'image/jpeg' }), 'student.jpg');

    const res = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      body: form,
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.statusCode, 201);
    assert.match(body.data.application.applicationNumber, /^SSG-\d{4}-[0-9A-F]{16}$/);
    assert.equal(body.data.application.status, 'Pending');
    assert.equal(uploadCalls, 1);
    assert.deepEqual(savedDoc.photo, {
      url: 'https://res.cloudinary.com/test_cloud/image/upload/v1/ss_global_school/student_applications/stu_01.jpg',
      public_id: 'ss_global_school/student_applications/stu_01',
    });
  });

  test('13. Cloudinary is not called when JSON or multipart submission has no photo', async () => {
    let uploadCalls = 0;
    cloudinary.uploader.upload = async () => {
      uploadCalls += 1;
      return { secure_url: 'https://example.com/x.jpg', public_id: 'x' };
    };
    StudentApplication.create = async (doc) => ({
      _id: '65f1a2b3c4d5e6f7a8b9c0d7',
      ...doc,
      createdAt: new Date(),
    });

    const form = new FormData();
    for (const [k, v] of Object.entries(validPayload())) {
      form.append(k, v);
    }

    const res = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      body: form,
    });

    assert.equal(res.status, 201);
    assert.equal(uploadCalls, 0);
  });

  test('14. Photo upload failure prevents StudentApplication creation', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
    process.env.CLOUDINARY_API_KEY = 'test_key';
    process.env.CLOUDINARY_API_SECRET = 'test_secret';

    let dbCreateCalled = false;
    cloudinary.uploader.upload = async () => {
      throw new Error('Cloudinary unreachable');
    };
    StudentApplication.create = async () => {
      dbCreateCalled = true;
      return {};
    };

    const form = new FormData();
    for (const [k, v] of Object.entries(validPayload())) {
      form.append(k, v);
    }
    form.append('photo', new Blob([JPEG_BYTES], { type: 'image/jpeg' }), 'student.jpg');

    const res = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      body: form,
    });

    assert.equal(res.status, 502);
    assert.equal(dbCreateCalled, false);
  });

  test('15. MongoDB failure after photo upload deletes the newly uploaded Cloudinary asset once', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
    process.env.CLOUDINARY_API_KEY = 'test_key';
    process.env.CLOUDINARY_API_SECRET = 'test_secret';

    const destroyedIds = [];
    cloudinary.uploader.upload = async () => ({
      secure_url: 'https://res.cloudinary.com/test_cloud/image/upload/v1/ss_global_school/student_applications/orphan_1.jpg',
      public_id: 'ss_global_school/student_applications/orphan_1',
    });
    cloudinary.uploader.destroy = async (publicId) => {
      destroyedIds.push(publicId);
      return { result: 'ok' };
    };
    StudentApplication.create = async () => {
      throw new Error('MongoDB write failure');
    };

    const form = new FormData();
    for (const [k, v] of Object.entries(validPayload())) {
      form.append(k, v);
    }
    form.append('photo', new Blob([JPEG_BYTES], { type: 'image/jpeg' }), 'student.jpg');

    const res = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      body: form,
    });

    assert.equal(res.status, 500);
    assert.deepEqual(destroyedIds, ['ss_global_school/student_applications/orphan_1']);
  });

  test('16. Application-number collision retry does not re-upload photo and preserves same photo on success', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
    process.env.CLOUDINARY_API_KEY = 'test_key';
    process.env.CLOUDINARY_API_SECRET = 'test_secret';

    let uploadCalls = 0;
    let dbAttempts = 0;
    const savedDocs = [];
    const destroyedIds = [];

    cloudinary.uploader.upload = async () => {
      uploadCalls += 1;
      return {
        secure_url: 'https://res.cloudinary.com/test_cloud/image/upload/v1/ss_global_school/student_applications/retry_ok.jpg',
        public_id: 'ss_global_school/student_applications/retry_ok',
      };
    };
    cloudinary.uploader.destroy = async (publicId) => {
      destroyedIds.push(publicId);
      return { result: 'ok' };
    };
    StudentApplication.create = async (doc) => {
      dbAttempts += 1;
      savedDocs.push(doc);
      if (dbAttempts === 1) {
        const dupErr = new Error('E11000 duplicate key error collection: applicationNumber');
        dupErr.code = 11000;
        dupErr.keyPattern = { applicationNumber: 1 };
        throw dupErr;
      }
      return { _id: '65f1a2b3c4d5e6f7a8b9c0d8', ...doc, createdAt: new Date() };
    };

    const form = new FormData();
    for (const [k, v] of Object.entries(validPayload())) {
      form.append(k, v);
    }
    form.append('photo', new Blob([JPEG_BYTES], { type: 'image/jpeg' }), 'student.jpg');

    const res = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      body: form,
    });

    assert.equal(res.status, 201);
    assert.equal(uploadCalls, 1);
    assert.equal(dbAttempts, 2);
    assert.deepEqual(destroyedIds, []);
    assert.deepEqual(savedDocs[1].photo, savedDocs[0].photo);
  });

  test('17. Exhausted duplicate-key retries clean up the uploaded Cloudinary asset exactly once', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
    process.env.CLOUDINARY_API_KEY = 'test_key';
    process.env.CLOUDINARY_API_SECRET = 'test_secret';

    let uploadCalls = 0;
    let dbAttempts = 0;
    const destroyedIds = [];

    cloudinary.uploader.upload = async () => {
      uploadCalls += 1;
      return {
        secure_url: 'https://res.cloudinary.com/test_cloud/image/upload/v1/ss_global_school/student_applications/retry_fail.jpg',
        public_id: 'ss_global_school/student_applications/retry_fail',
      };
    };
    cloudinary.uploader.destroy = async (publicId) => {
      destroyedIds.push(publicId);
      return { result: 'ok' };
    };
    StudentApplication.create = async () => {
      dbAttempts += 1;
      const dupErr = new Error('E11000 duplicate key error collection: applicationNumber');
      dupErr.code = 11000;
      dupErr.keyPattern = { applicationNumber: 1 };
      throw dupErr;
    };

    const form = new FormData();
    for (const [k, v] of Object.entries(validPayload())) {
      form.append(k, v);
    }
    form.append('photo', new Blob([JPEG_BYTES], { type: 'image/jpeg' }), 'student.jpg');

    const res = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      body: form,
    });

    assert.equal(res.status, 500);
    assert.equal(uploadCalls, 1);
    assert.equal(dbAttempts, 4);
    assert.deepEqual(destroyedIds, ['ss_global_school/student_applications/retry_fail']);
  });

  test('18. Validation failure on multipart request cleans up temporary photo file and rejects fake JSON photo field', async () => {
    const beforeFiles = new Set(fs.readdirSync(uploadsDir));

    const form = new FormData();
    for (const [k, v] of Object.entries(validPayload({ fullName: 'A' }))) {
      form.append(k, v);
    }
    form.append('photo', new Blob([JPEG_BYTES], { type: 'image/jpeg' }), 'student.jpg');

    const res = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      body: form,
    });

    assert.equal(res.status, 400);
    const afterFiles = fs.readdirSync(uploadsDir);
    const leaked = afterFiles.filter((f) => !beforeFiles.has(f) && f.startsWith('student-photo-'));
    assert.deepEqual(leaked, []);

    const fakePhotoRes = await fetch(`${baseUrl}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        validPayload({ photo: { url: 'https://evil.example.com/fake.jpg', public_id: 'fake' } })
      ),
    });
    assert.equal(fakePhotoRes.status, 400);
  });
});
