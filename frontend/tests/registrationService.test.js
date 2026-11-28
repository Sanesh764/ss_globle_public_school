import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// Provide minimal browser globals for api.js module evaluation in Node
if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    location: { hostname: 'localhost' },
  };
}
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

const { default: API } = await import('../src/services/api.js');
const { submitStudentRegistration } = await import('../src/services/registrationService.js');

const originalPost = API.post.bind(API);

const buildValidFormValues = (overrides = {}) => ({
  fullName: '  Aarav Sharma  ',
  dateOfBirth: '2015-05-14',
  gender: 'Male',
  fatherName: '  Vikram Sharma  ',
  motherName: '  Priya Sharma  ',
  contactNumber: '+91 98765-43210',
  classApplyingFor: 'Class 5',
  email: '',
  ...overrides,
});

describe('Frontend registrationService Tests', () => {
  let capturedCalls = [];

  beforeEach(() => {
    capturedCalls = [];
  });

  afterEach(() => {
    API.post = originalPost;
  });

  test('1-8. Sends sanitized JSON payload to /registrations when photo is absent', async () => {
    const mockServerResponse = {
      statusCode: 201,
      success: true,
      message: 'Student registration application submitted successfully.',
      data: {
        application: {
          _id: '65f1a2b3c4d5e6f7a8b9c0d1',
          applicationNumber: 'SSG-2026-A1B2C3D4E5F60718',
          fullName: 'Aarav Sharma',
          classApplyingFor: 'Class 5',
          status: 'Pending',
          createdAt: '2026-11-28T06:00:00.000Z',
        },
      },
    };

    API.post = async (url, data, config) => {
      capturedCalls.push({ url, data, config });
      return { data: mockServerResponse };
    };

    const result = await submitStudentRegistration(
      buildValidFormValues({
        email: '  Sanesh.Gupta+School@gmail.com  ',
        status: 'Approved',
        applicationNumber: 'CUSTOM-123',
        reviewedBy: 'admin_1',
        reviewHistory: [{ action: 'FAKE' }],
      })
    );

    assert.equal(capturedCalls.length, 1);
    assert.equal(capturedCalls[0].url, '/registrations');
    assert.equal(capturedCalls[0].config, undefined);
    assert.deepEqual(capturedCalls[0].data, {
      fullName: 'Aarav Sharma',
      dateOfBirth: '2015-05-14',
      gender: 'Male',
      fatherName: 'Vikram Sharma',
      motherName: 'Priya Sharma',
      contactNumber: '9876543210',
      classApplyingFor: 'Class 5',
      email: 'sanesh.gupta+school@gmail.com',
    });
    assert.equal('photo' in capturedCalls[0].data, false);
    assert.equal('status' in capturedCalls[0].data, false);
    assert.equal('applicationNumber' in capturedCalls[0].data, false);
    assert.equal('reviewedBy' in capturedCalls[0].data, false);
    assert.equal('reviewHistory' in capturedCalls[0].data, false);
    assert.deepEqual(result, mockServerResponse);

    // Blank email is omitted
    await submitStudentRegistration(buildValidFormValues({ email: '   ' }));
    assert.equal('email' in capturedCalls[1].data, false);
  });

  test('9-15. Sends FormData with photo field and unsets JSON Content-Type header when photo is present', async () => {
    const mockPhoto = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], {
      type: 'image/jpeg',
    });

    API.post = async (url, data, config) => {
      capturedCalls.push({ url, data, config });
      return {
        data: {
          statusCode: 201,
          success: true,
          data: {
            application: {
              _id: '65f1a2b3c4d5e6f7a8b9c0d2',
              applicationNumber: 'SSG-2026-B1C2D3E4F5A60718',
              fullName: 'Aarav Sharma',
              classApplyingFor: 'Class 5',
              status: 'Pending',
              createdAt: '2026-11-28T06:00:00.000Z',
            },
          },
        },
      };
    };

    const result = await submitStudentRegistration(
      buildValidFormValues({ email: 'Parent@Example.COM' }),
      mockPhoto
    );

    assert.equal(capturedCalls.length, 1);
    const { url, data, config } = capturedCalls[0];
    assert.equal(url, '/registrations');
    assert.ok(data instanceof FormData);
    assert.equal(data.get('fullName'), 'Aarav Sharma');
    assert.equal(data.get('dateOfBirth'), '2015-05-14');
    assert.equal(data.get('gender'), 'Male');
    assert.equal(data.get('fatherName'), 'Vikram Sharma');
    assert.equal(data.get('motherName'), 'Priya Sharma');
    assert.equal(data.get('contactNumber'), '9876543210');
    assert.equal(data.get('classApplyingFor'), 'Class 5');
    assert.equal(data.get('email'), 'parent@example.com');

    const appendedPhoto = data.get('photo');
    assert.ok(appendedPhoto instanceof Blob);
    assert.notEqual(typeof appendedPhoto, 'string');

    // Request-specific header override unsets default application/json without breaking global API defaults
    assert.ok(config && config.headers);
    assert.equal('Content-Type' in config.headers, true);
    assert.equal(config.headers['Content-Type'], undefined);
    assert.equal(API.defaults.headers['Content-Type'], 'application/json');

    assert.equal(result.success, true);
    assert.equal(result.data.application.status, 'Pending');

    // Blank email is omitted from FormData too
    await submitStudentRegistration(buildValidFormValues({ email: '' }), mockPhoto);
    assert.equal(capturedCalls[1].data.has('email'), false);
  });

  test('16. Propagates Axios errors without hiding them', async () => {
    const apiError = new Error('Too many requests');
    apiError.response = {
      status: 429,
      data: { success: false, message: 'Too many registration applications submitted.' },
    };

    API.post = async () => {
      throw apiError;
    };

    await assert.rejects(
      () => submitStudentRegistration(buildValidFormValues()),
      (err) => err === apiError && err.response.status === 429
    );
  });
});
