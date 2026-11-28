import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_STUDENT_PAGE_SIZE,
  STUDENT_STATUS_FILTER_OPTIONS,
  buildStudentListQueryParams,
  normalizeStudentListResponse,
  getStudentStatusSummaryLabel,
  getStudentListErrorMessage,
  getSafeBoundedPage,
} from '../src/utils/adminStudentListUtils.js';

describe('Admin Student Listing Utilities Tests', () => {
  test('1-2. Builds default pagination query params and omits empty search/All filters', () => {
    assert.equal(DEFAULT_STUDENT_PAGE_SIZE, 15);
    assert.deepEqual(buildStudentListQueryParams(), {
      page: 1,
      limit: 15,
    });
    assert.deepEqual(
      buildStudentListQueryParams({
        page: 1,
        search: '   ',
        className: 'All',
        statusFilter: 'all',
      }),
      {
        page: 1,
        limit: 15,
      }
    );
  });

  test('3-8. Maps search, className, and Active/Inactive/All status filters accurately', () => {
    // Active Students -> isActive: true
    assert.deepEqual(
      buildStudentListQueryParams({
        page: 2,
        search: '  Aarav  ',
        className: 'Class 9',
        statusFilter: 'active',
      }),
      {
        page: 2,
        limit: 15,
        search: 'Aarav',
        className: 'Class 9',
        isActive: true,
      }
    );

    // Inactive Students -> isActive: false
    assert.deepEqual(
      buildStudentListQueryParams({
        page: 1,
        className: 'Class 10',
        statusFilter: 'inactive',
      }),
      {
        page: 1,
        limit: 15,
        className: 'Class 10',
        isActive: false,
      }
    );

    // All Students -> omits isActive
    const allParams = buildStudentListQueryParams({ statusFilter: 'all' });
    assert.equal(Object.prototype.hasOwnProperty.call(allParams, 'isActive'), false);
    assert.equal(STUDENT_STATUS_FILTER_OPTIONS.length, 3);
  });

  test('10 & 12. Normalizes API listing response and handles empty or malformed payloads safely', () => {
    const valid = normalizeStudentListResponse(
      {
        data: {
          students: [{ _id: 'stu_1', fullName: 'Aarav Sharma', isActive: true }],
          pagination: { totalRecords: 20, currentPage: 2, pageSize: 15, totalPages: 2 },
        },
      },
      2
    );
    assert.equal(valid.students.length, 1);
    assert.deepEqual(valid.pagination, {
      totalRecords: 20,
      currentPage: 2,
      pageSize: 15,
      totalPages: 2,
    });

    const malformed = normalizeStudentListResponse(null, 3);
    assert.deepEqual(malformed.students, []);
    assert.deepEqual(malformed.pagination, {
      totalRecords: 0,
      currentPage: 3,
      pageSize: 15,
      totalPages: 0,
    });
  });

  test('13. Formats summary labels and error messages safely including 401/403', () => {
    assert.equal(
      getStudentStatusSummaryLabel('active', 'Class 9'),
      'Active Students • Class 9'
    );
    assert.equal(
      getStudentStatusSummaryLabel('all', 'All'),
      'All Students • All Classes'
    );

    assert.equal(
      getStudentListErrorMessage({ response: { status: 401 } }),
      'You are not authorized to view student records.'
    );
    assert.equal(
      getStudentListErrorMessage({ response: { status: 403 } }),
      'You are not authorized to view student records.'
    );
    assert.equal(
      getStudentListErrorMessage({ response: { status: 500, data: { message: 'DB error' } } }),
      'DB error'
    );
    assert.equal(
      getStudentListErrorMessage(new Error('Network')),
      'Failed to load students. Please try again.'
    );
  });

  test('14. getSafeBoundedPage never returns 0 when totalPages is 0 or shrinks below currentPage', () => {
    assert.equal(getSafeBoundedPage(2, 0), 1);
    assert.equal(getSafeBoundedPage(1, 0), 1);
    assert.equal(getSafeBoundedPage(3, 2), 2);
    assert.equal(getSafeBoundedPage(2, 5), 2);
    assert.equal(getSafeBoundedPage(0, 0), 1);
  });
});
