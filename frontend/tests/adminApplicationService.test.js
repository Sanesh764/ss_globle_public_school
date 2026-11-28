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
  getAdminApplications,
  getAdminApplicationById,
  updateAdminApplication,
  approveAdminApplication,
  requestAdminApplicationCorrection,
  rejectAdminApplication,
} = await import('../src/services/adminApplicationService.js');

const originalGet = API.get.bind(API);
const originalPatch = API.patch.bind(API);

describe('Frontend adminApplicationService Tests', () => {
  let capturedCalls = [];

  beforeEach(() => {
    capturedCalls = [];
  });

  afterEach(() => {
    API.get = originalGet;
    API.patch = originalPatch;
  });

  test('1-3. Lists applications with supported filters, removes empty/"All" filters, and handles no filters', async () => {
    const mockListResponse = {
      statusCode: 200,
      success: true,
      data: {
        applications: [{ _id: 'app_1', applicationNumber: 'SSG-2026-1234' }],
        pagination: { totalRecords: 1, currentPage: 1, pageSize: 15, totalPages: 1 },
      },
    };

    API.get = async (url, config) => {
      capturedCalls.push({ url, config });
      return { data: mockListResponse };
    };

    // 1. All supported filters
    const fullRes = await getAdminApplications({
      page: 2,
      limit: 10,
      search: '  Aarav  ',
      status: 'Pending',
      classApplyingFor: 'Class 5',
    });
    assert.deepEqual(fullRes, mockListResponse);
    assert.equal(capturedCalls[0].url, '/admin/applications');
    assert.deepEqual(capturedCalls[0].config, {
      params: {
        page: 2,
        limit: 10,
        search: 'Aarav',
        status: 'Pending',
        classApplyingFor: 'Class 5',
      },
    });

    // 2. Removal of empty, null, undefined, and "All" filters
    await getAdminApplications({
      page: 1,
      limit: 15,
      search: '   ',
      status: 'All',
      classApplyingFor: 'Class 5',
      extraUnused: undefined,
    });
    assert.deepEqual(capturedCalls[1].config, {
      params: {
        page: 1,
        limit: 15,
        classApplyingFor: 'Class 5',
      },
    });

    // 3. No filters at all
    await getAdminApplications();
    assert.equal(capturedCalls[2].url, '/admin/applications');
    assert.equal(capturedCalls[2].config, undefined);
  });

  test('4 & 9. Fetches application details by ID and returns response.data', async () => {
    const mockDetail = {
      statusCode: 200,
      success: true,
      data: { application: { _id: 'app_123', fullName: 'Aarav Sharma' } },
    };

    API.get = async (url) => {
      capturedCalls.push({ url });
      return { data: mockDetail };
    };

    const res = await getAdminApplicationById('app_123');
    assert.equal(capturedCalls[0].url, '/admin/applications/app_123');
    assert.deepEqual(res, mockDetail);
  });

  test('5. Edits an application with allowed fields only', async () => {
    const mockUpdated = {
      statusCode: 200,
      success: true,
      data: { application: { _id: 'app_123', fullName: 'Aarav Verma' } },
    };

    API.patch = async (url, body) => {
      capturedCalls.push({ url, body });
      return { data: mockUpdated };
    };

    const res = await updateAdminApplication('app_123', {
      fullName: 'Aarav Verma',
      note: 'Spelling fix',
      status: 'Approved', // must be stripped
    });

    assert.equal(capturedCalls[0].url, '/admin/applications/app_123');
    assert.deepEqual(capturedCalls[0].body, {
      fullName: 'Aarav Verma',
      note: 'Spelling fix',
    });
    assert.deepEqual(res, mockUpdated);
  });

  test('6. Approves an application with optional note', async () => {
    const mockApproval = {
      statusCode: 200,
      success: true,
      data: { approval: { status: 'Approved', approvedStudentId: 'stu_1' } },
    };

    API.patch = async (url, body) => {
      capturedCalls.push({ url, body });
      return { data: mockApproval };
    };

    const res1 = await approveAdminApplication('app_123');
    assert.equal(capturedCalls[0].url, '/admin/applications/app_123/approve');
    assert.deepEqual(capturedCalls[0].body, {});
    assert.deepEqual(res1, mockApproval);

    await approveAdminApplication('app_123', { note: '  Verified  ' });
    assert.deepEqual(capturedCalls[1].body, { note: 'Verified' });
  });

  test('7. Requests correction with trimmed correctionMessage', async () => {
    const mockCorrection = {
      statusCode: 200,
      success: true,
      data: { application: { status: 'Correction Requested' } },
    };

    API.patch = async (url, body) => {
      capturedCalls.push({ url, body });
      return { data: mockCorrection };
    };

    const res = await requestAdminApplicationCorrection(
      'app_123',
      '  Please verify father name  '
    );
    assert.equal(capturedCalls[0].url, '/admin/applications/app_123/request-correction');
    assert.deepEqual(capturedCalls[0].body, {
      correctionMessage: 'Please verify father name',
    });
    assert.deepEqual(res, mockCorrection);
  });

  test('8. Rejects application with trimmed rejectionReason', async () => {
    const mockRejection = {
      statusCode: 200,
      success: true,
      data: { application: { status: 'Rejected' } },
    };

    API.patch = async (url, body) => {
      capturedCalls.push({ url, body });
      return { data: mockRejection };
    };

    const res = await rejectAdminApplication('app_123', '  Duplicate entry  ');
    assert.equal(capturedCalls[0].url, '/admin/applications/app_123/reject');
    assert.deepEqual(capturedCalls[0].body, {
      rejectionReason: 'Duplicate entry',
    });
    assert.deepEqual(res, mockRejection);
  });

  test('10. Propagates Axios errors including HTTP 409 conflict without swallowing', async () => {
    const conflictError = new Error('Conflict');
    conflictError.response = {
      status: 409,
      data: {
        success: false,
        message: "Application cannot be approved because its status is 'Approved'.",
      },
    };

    API.patch = async () => {
      throw conflictError;
    };

    await assert.rejects(
      () => approveAdminApplication('app_123'),
      (err) => err === conflictError && err.response.status === 409
    );
  });
});
