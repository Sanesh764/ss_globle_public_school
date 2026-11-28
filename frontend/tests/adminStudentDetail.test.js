import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeStudentDetail,
  formatAdmittedBySummary,
  getStudentDetailErrorMessage,
} from '../src/utils/adminStudentDetailUtils.js';

describe('Admin Student Detail Utilities Tests', () => {
  test('1-3 & 7, 10. Normalizes complete Student detail response including photoUrl, admittedBy, and isActive', () => {
    const res = {
      data: {
        student: {
          _id: 'stu_1',
          fullName: 'Aarav Sharma',
          dateOfBirth: '2013-06-15T00:00:00.000Z',
          gender: 'Male',
          fatherName: 'Vikram Sharma',
          motherName: 'Priya Sharma',
          contactNumber: '9876543210',
          email: 'parent@example.com',
          className: 'Class 9',
          photo: { url: 'https://res.cloudinary.com/demo/image/upload/v1/aarav.jpg' },
          admissionNumber: 'ADM-2026-0001',
          applicationNumber: 'SSG-2026-1234',
          isActive: true,
          admittedAt: '2026-11-10T10:30:00.000Z',
          createdAt: '2026-11-10T10:30:00.000Z',
          updatedAt: '2026-11-12T12:00:00.000Z',
          admittedBy: {
            name: 'School Admin',
            email: 'admin@ssglobal.edu.in',
            role: 'admin',
          },
        },
      },
    };

    const normalized = normalizeStudentDetail(res);
    assert.equal(normalized._id, 'stu_1');
    assert.equal(normalized.fullName, 'Aarav Sharma');
    assert.equal(normalized.className, 'Class 9');
    assert.equal(
      normalized.photoUrl,
      'https://res.cloudinary.com/demo/image/upload/v1/aarav.jpg'
    );
    assert.equal(normalized.admissionNumber, 'ADM-2026-0001');
    assert.equal(normalized.isActive, true);
    assert.deepEqual(normalized.admittedBy, {
      hasMetadata: true,
      name: 'School Admin',
      email: 'admin@ssglobal.edu.in',
      role: 'admin',
    });
  });

  test('4-6 & 8, 10. Handles missing optional fields (email, photo, admissionNumber, admittedBy) and Inactive status', () => {
    const res = {
      data: {
        student: {
          _id: 'stu_2',
          fullName: 'Diya Patel',
          gender: 'Female',
          fatherName: 'Rajesh Patel',
          motherName: 'Meera Patel',
          contactNumber: '9876543211',
          email: null,
          className: 'Class 10',
          photo: { url: '' },
          admissionNumber: null,
          applicationNumber: null,
          isActive: false,
          admittedBy: null,
        },
      },
    };

    const normalized = normalizeStudentDetail(res);
    assert.equal(normalized.email, null);
    assert.equal(normalized.photoUrl, '');
    assert.equal(normalized.admissionNumber, null);
    assert.equal(normalized.applicationNumber, null);
    assert.equal(normalized.isActive, false);
    assert.deepEqual(normalized.admittedBy, {
      hasMetadata: false,
      name: 'Not available',
      email: 'Not available',
      role: 'Not available',
    });

    assert.equal(normalizeStudentDetail(null), null);
    assert.deepEqual(formatAdmittedBySummary(undefined), {
      hasMetadata: false,
      name: 'Not available',
      email: 'Not available',
      role: 'Not available',
    });
  });

  test('12. Classifies 400, 401/403, 404, and 500/network errors accurately', () => {
    assert.equal(
      getStudentDetailErrorMessage({ response: { status: 400, data: { message: 'Bad ID' } } }),
      'Bad ID'
    );
    assert.equal(
      getStudentDetailErrorMessage({ response: { status: 401 } }),
      'You are not authorized to view this student record.'
    );
    assert.equal(
      getStudentDetailErrorMessage({ response: { status: 403 } }),
      'You are not authorized to view this student record.'
    );
    assert.equal(
      getStudentDetailErrorMessage({ response: { status: 404 } }),
      'Student record was not found.'
    );
    assert.equal(
      getStudentDetailErrorMessage(new Error('Network Error')),
      'Failed to load student details. Please try again.'
    );
  });
});
