import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cloudinary } from '../../src/config/cloudinary.js';
import {
  uploadStudentPhotoToCloudinary,
  deleteStudentPhotoFromCloudinary,
  STUDENT_PHOTO_CLOUDINARY_FOLDER,
} from '../../src/utils/studentPhotoStorage.js';
import { ApiError } from '../../src/utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

const originalUpload = cloudinary.uploader.upload;
const originalDestroy = cloudinary.uploader.destroy;
const originalEnv = {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

const createTempPhotoFile = (name = `student-photo-test-${Date.now()}.jpg`) => {
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, name);
  fs.writeFileSync(filePath, Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]));
  return {
    path: filePath,
    filename: name,
    originalname: 'photo.jpg',
    mimetype: 'image/jpeg',
  };
};

describe('studentPhotoStorage Utility Tests', () => {
  beforeEach(() => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
    process.env.CLOUDINARY_API_KEY = 'test_key';
    process.env.CLOUDINARY_API_SECRET = 'test_secret';
  });

  afterEach(() => {
    cloudinary.uploader.upload = originalUpload;
    cloudinary.uploader.destroy = originalDestroy;
    process.env.CLOUDINARY_CLOUD_NAME = originalEnv.CLOUDINARY_CLOUD_NAME;
    process.env.CLOUDINARY_API_KEY = originalEnv.CLOUDINARY_API_KEY;
    process.env.CLOUDINARY_API_SECRET = originalEnv.CLOUDINARY_API_SECRET;
  });

  test('1-5. Uploads to dedicated folder with resource_type image, returns secure_url & public_id, and deletes temp file', async () => {
    const tempFile = createTempPhotoFile('student-photo-unit-1.jpg');
    let capturedOptions = null;

    cloudinary.uploader.upload = async (filePath, options) => {
      capturedOptions = options;
      return {
        secure_url: 'https://res.cloudinary.com/test_cloud/image/upload/v1/ss_global_school/student_applications/abc123.jpg',
        public_id: 'ss_global_school/student_applications/abc123',
      };
    };

    const result = await uploadStudentPhotoToCloudinary(tempFile);

    assert.equal(capturedOptions.folder, STUDENT_PHOTO_CLOUDINARY_FOLDER);
    assert.equal(capturedOptions.folder, 'ss_global_school/student_applications');
    assert.equal(capturedOptions.resource_type, 'image');
    assert.equal(capturedOptions.use_filename, false);
    assert.equal(capturedOptions.unique_filename, true);

    assert.deepEqual(result, {
      url: 'https://res.cloudinary.com/test_cloud/image/upload/v1/ss_global_school/student_applications/abc123.jpg',
      public_id: 'ss_global_school/student_applications/abc123',
    });

    assert.equal(fs.existsSync(tempFile.path), false, 'Temporary local file must be deleted');
  });

  test('6 & 13. Fails closed with HTTP 503 when Cloudinary is not configured and never falls back to local URL', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    const tempFile = createTempPhotoFile('student-photo-unit-2.jpg');

    await assert.rejects(
      () => uploadStudentPhotoToCloudinary(tempFile),
      (err) => err instanceof ApiError && err.statusCode === 503
    );

    assert.equal(fs.existsSync(tempFile.path), false, 'Temp file must be cleaned up even when unconfigured');
  });

  test('7, 8 & 13. Fails closed on Cloudinary upload error, cleans up temp file, and never falls back to /uploads/', async () => {
    const tempFile = createTempPhotoFile('student-photo-unit-3.jpg');

    cloudinary.uploader.upload = async () => {
      throw new Error('Network timeout');
    };

    await assert.rejects(
      () => uploadStudentPhotoToCloudinary(tempFile),
      (err) => err instanceof ApiError && err.statusCode === 502
    );

    assert.equal(fs.existsSync(tempFile.path), false, 'Temp file must be cleaned up on upload failure');
  });

  test('9 & 10. Rejects invalid Cloudinary result (non-HTTPS or missing URL) and destroys partially uploaded asset', async () => {
    const tempFile = createTempPhotoFile('student-photo-unit-4.jpg');
    const destroyedIds = [];

    cloudinary.uploader.upload = async () => ({
      secure_url: 'http://insecure.example.com/photo.jpg',
      public_id: 'ss_global_school/student_applications/partial_asset_1',
    });
    cloudinary.uploader.destroy = async (publicId, opts) => {
      destroyedIds.push({ publicId, opts });
      return { result: 'ok' };
    };

    await assert.rejects(
      () => uploadStudentPhotoToCloudinary(tempFile),
      (err) => err instanceof ApiError && err.statusCode === 502
    );

    assert.deepEqual(destroyedIds, [
      {
        publicId: 'ss_global_school/student_applications/partial_asset_1',
        opts: { resource_type: 'image' },
      },
    ]);
    assert.equal(fs.existsSync(tempFile.path), false);
  });

  test('11. Deletes existing Cloudinary asset by public_id and handles not found safely', async () => {
    cloudinary.uploader.destroy = async (publicId, opts) => {
      assert.equal(opts.resource_type, 'image');
      if (publicId === 'ss_global_school/student_applications/missing') {
        return { result: 'not found' };
      }
      return { result: 'ok' };
    };

    const okRes = await deleteStudentPhotoFromCloudinary(
      'ss_global_school/student_applications/abc123'
    );
    assert.deepEqual(okRes, {
      deleted: true,
      result: 'ok',
      public_id: 'ss_global_school/student_applications/abc123',
    });

    const missingRes = await deleteStudentPhotoFromCloudinary(
      'ss_global_school/student_applications/missing'
    );
    assert.deepEqual(missingRes, {
      deleted: false,
      result: 'not found',
      public_id: 'ss_global_school/student_applications/missing',
    });
  });

  test('12. Rejects empty, non-string, or URL inputs for deletion', async () => {
    for (const badInput of ['', '   ', null, undefined, 123, 'https://res.cloudinary.com/demo/image.jpg']) {
      await assert.rejects(
        () => deleteStudentPhotoFromCloudinary(badInput),
        (err) => err instanceof ApiError && err.statusCode === 400
      );
    }
  });
});
