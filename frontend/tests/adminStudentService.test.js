import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

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
const {
  getAdminStudents,
  getAdminStudentById,
  updateAdminStudent,
  updateAdminStudentStatus,
} = await import('../src/services/adminStudentService.js');

const originalGet = API.get.bind(API);
const originalPatch = API.patch.bind(API);

describe('Frontend adminStudentService Tests', () => {
  let capturedCalls = [];

  beforeEach(() => {
    capturedCalls = [];
  });

  afterEach(() => {
    API.get = originalGet;
    API.patch = originalPatch;
  });

  test('1-5. Lists students with defaults, supported filters, omits empty/"All", and preserves isActive: false/true', async () => {
    const mockListResponse = {
      statusCode: 200,
      success: true,
      data: {
        students: [{ _id: 'stu_1', fullName: 'Aarav Sharma', isActive: false }],
        pagination: { totalRecords: 1, currentPage: 1, pageSize: 15, totalPages: 1 },
      },
    };

    API.get = async (url, config) => {
      capturedCalls.push({ url, config });
      return { data: mockListResponse };
    };

    // 1. Default parameters
    const defaultRes = await getAdminStudents();
    assert.deepEqual(defaultRes, mockListResponse);
    assert.equal(capturedCalls[0].url, '/admin/students');
    assert.deepEqual(capturedCalls[0].config, {
      params: { page: 1, limit: 15 },
    });

    // 2. All supported filters
    await getAdminStudents({
      page: 2,
      limit: 25,
      search: '  Aarav  ',
      className: 'Class 9',
      isActive: true,
    });
    assert.deepEqual(capturedCalls[1].config, {
      params: {
        page: 2,
        limit: 25,
        search: 'Aarav',
        className: 'Class 9',
        isActive: true,
      },
    });

    // 3-4. Remove empty / "All" filters and preserve isActive: false
    await getAdminStudents({
      page: 1,
      limit: 15,
      search: '   ',
      className: 'All',
      isActive: false,
      unusedField: undefined,
      nullField: null,
    });
    assert.deepEqual(capturedCalls[2].config, {
      params: {
        page: 1,
        limit: 15,
        isActive: false,
      },
    });

    // 5. Preserve isActive: true
    await getAdminStudents({ isActive: true });
    assert.deepEqual(capturedCalls[3].config, {
      params: {
        page: 1,
        limit: 15,
        isActive: true,
      },
    });
  });

  test('6 & 13. Fetches student details by ID and returns response.data', async () => {
    const mockDetailResponse = {
      statusCode: 200,
      success: true,
      data: {
        student: {
          _id: 'stu_1',
          fullName: 'Aarav Sharma',
          className: 'Class 9',
          isActive: true,
        },
      },
    };

    API.get = async (url) => {
      capturedCalls.push({ url });
      return { data: mockDetailResponse };
    };

    const res = await getAdminStudentById('stu_1');
    assert.equal(capturedCalls[0].url, '/admin/students/stu_1');
    assert.deepEqual(res, mockDetailResponse);
  });

  test('7-9. Updates student with allowlisted fields, supports partial updates, and excludes protected fields', async () => {
    const mockUpdateResponse = {
      statusCode: 200,
      success: true,
      data: { student: { _id: 'stu_1', fullName: 'Aarav Updated' } },
    };

    API.patch = async (url, body) => {
      capturedCalls.push({ url, body });
      return { data: mockUpdateResponse };
    };

    // Full editable payload with protected fields injected
    const fullRes = await updateAdminStudent('stu_1', {
      _id: 'tampered_id',
      sourceApplicationId: 'tampered_app',
      applicationNumber: 'SSG-HACK',
      admittedBy: 'tampered_admin',
      admittedAt: '2026-01-01',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      isActive: false,
      photo: { url: 'https://evil.test/x.jpg' },
      admissionNumber: 'ADM-HACK',
      fullName: 'Aarav Updated',
      dateOfBirth: '2013-06-15',
      gender: 'Male',
      fatherName: 'Vikram Sharma',
      motherName: 'Priya Sharma',
      contactNumber: '9876543210',
      className: 'Class 10',
      email: 'parent@example.com',
    });

    assert.deepEqual(fullRes, mockUpdateResponse);
    assert.equal(capturedCalls[0].url, '/admin/students/stu_1');
    assert.deepEqual(capturedCalls[0].body, {
      fullName: 'Aarav Updated',
      dateOfBirth: '2013-06-15',
      gender: 'Male',
      fatherName: 'Vikram Sharma',
      motherName: 'Priya Sharma',
      contactNumber: '9876543210',
      className: 'Class 10',
      email: 'parent@example.com',
    });

    // Partial update
    await updateAdminStudent('stu_1', { className: 'Class 11' });
    assert.deepEqual(capturedCalls[1].body, { className: 'Class 11' });
  });

  test('10-12. Updates status with boolean true/false and rejects invalid status before API call', async () => {
    const mockStatusResponse = {
      statusCode: 200,
      success: true,
      data: { student: { _id: 'stu_1', isActive: false } },
    };

    API.patch = async (url, body) => {
      capturedCalls.push({ url, body });
      return { data: mockStatusResponse };
    };

    const resFalse = await updateAdminStudentStatus('stu_1', false);
    assert.deepEqual(resFalse, mockStatusResponse);
    assert.equal(capturedCalls[0].url, '/admin/students/stu_1/status');
    assert.deepEqual(capturedCalls[0].body, { isActive: false });

    await updateAdminStudentStatus('stu_1', true);
    assert.equal(capturedCalls[1].url, '/admin/students/stu_1/status');
    assert.deepEqual(capturedCalls[1].body, { isActive: true });

    for (const invalidStatus of ['true', 'false', 1, 0, null, undefined, {}]) {
      await assert.rejects(
        () => updateAdminStudentStatus('stu_1', invalidStatus),
        TypeError
      );
    }
    assert.equal(capturedCalls.length, 2);
  });

  test('14-17. Propagates Axios 400, 401, 403, 404, 409, and 500 errors without swallowing', async () => {
    for (const status of [400, 401, 403, 404, 409, 500]) {
      const apiError = Object.assign(new Error(`HTTP ${status}`), {
        response: { status, data: { message: `Error ${status}` } },
      });

      API.get = async () => {
        throw apiError;
      };
      API.patch = async () => {
        throw apiError;
      };

      await assert.rejects(() => getAdminStudents(), (err) => err.response.status === status);
      await assert.rejects(
        () => getAdminStudentById('stu_1'),
        (err) => err.response.status === status
      );
      await assert.rejects(
        () => updateAdminStudent('stu_1', { fullName: 'Test' }),
        (err) => err.response.status === status
      );
      await assert.rejects(
        () => updateAdminStudentStatus('stu_1', false),
        (err) => err.response.status === status
      );
    }
  });
});
