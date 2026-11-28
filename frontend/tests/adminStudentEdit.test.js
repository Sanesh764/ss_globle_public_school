import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  EDITABLE_STUDENT_FIELDS,
  formatStudentDateForInput,
  buildStudentEditFormValues,
  validateAdminStudentEdit,
  buildAdminStudentUpdatePayload,
  hasUnsavedStudentEditChanges,
  getStudentEditErrorDetails,
} from '../src/utils/adminStudentEditUtils.js';

const SAMPLE_STUDENT = {
  _id: 'stu_1',
  fullName: 'Aarav Sharma',
  dateOfBirth: '2013-06-15T00:00:00.000Z',
  gender: 'Male',
  fatherName: 'Vikram Sharma',
  motherName: 'Priya Sharma',
  contactNumber: '9876543210',
  className: 'Class 9',
  email: 'Sanesh.Gupta+Tag@gmail.com',
  isActive: true,
  admissionNumber: 'ADM-2026-0001',
  applicationNumber: 'SSG-2026-1234',
  sourceApplicationId: 'app_1',
};

describe('Admin Student Edit Utilities Tests', () => {
  test('1-2. Allowlists exactly the 8 editable Student fields and excludes protected fields', () => {
    assert.deepEqual(EDITABLE_STUDENT_FIELDS, [
      'fullName',
      'dateOfBirth',
      'gender',
      'fatherName',
      'motherName',
      'contactNumber',
      'className',
      'email',
    ]);

    const payload = buildAdminStudentUpdatePayload({
      ...SAMPLE_STUDENT,
      _id: 'hack',
      sourceApplicationId: 'hack',
      applicationNumber: 'hack',
      admittedBy: 'hack',
      admittedAt: '2026-01-01',
      isActive: false,
      photo: { url: 'https://evil.test/x.jpg' },
      admissionNumber: 'ADM-HACK',
    });

    assert.deepEqual(Object.keys(payload).sort(), [...EDITABLE_STUDENT_FIELDS].sort());
    assert.equal(payload._id, undefined);
    assert.equal(payload.isActive, undefined);
    assert.equal(payload.admissionNumber, undefined);
    assert.equal(payload.sourceApplicationId, undefined);
  });

  test('3-4. Formats ISO dates without timezone shift and prefills Student edit form', () => {
    assert.equal(formatStudentDateForInput('2013-06-15T00:00:00.000Z'), '2013-06-15');
    assert.equal(formatStudentDateForInput('2013-06-15'), '2013-06-15');
    assert.equal(formatStudentDateForInput(''), '');
    assert.equal(formatStudentDateForInput('invalid'), '');

    const prefilled = buildStudentEditFormValues(SAMPLE_STUDENT);
    assert.deepEqual(prefilled, {
      fullName: 'Aarav Sharma',
      dateOfBirth: '2013-06-15',
      gender: 'Male',
      fatherName: 'Vikram Sharma',
      motherName: 'Priya Sharma',
      contactNumber: '9876543210',
      className: 'Class 9',
      email: 'Sanesh.Gupta+Tag@gmail.com',
    });
  });

  test('5-8. Validates DOB, gender, className, and Indian contact number', () => {
    const valid = validateAdminStudentEdit(buildStudentEditFormValues(SAMPLE_STUDENT));
    assert.deepEqual(valid, {});

    const invalid = validateAdminStudentEdit({
      fullName: 'A',
      dateOfBirth: '2099-01-01',
      gender: 'Unknown',
      fatherName: ' ',
      motherName: 'M',
      contactNumber: '12345',
      className: 'Class 13',
      email: 'bad-email',
    });

    assert.ok(invalid.fullName);
    assert.ok(invalid.dateOfBirth);
    assert.ok(invalid.gender);
    assert.ok(invalid.fatherName);
    assert.ok(invalid.motherName);
    assert.ok(invalid.contactNumber);
    assert.ok(invalid.className);
    assert.equal(invalid.classApplyingFor, undefined);
    assert.ok(invalid.email);
  });

  test('8-11. Normalizes contact/email, clears optional email, and builds partial payload', () => {
    const formValues = {
      ...buildStudentEditFormValues(SAMPLE_STUDENT),
      contactNumber: '+91 98765-43219',
      className: 'Class 10',
      email: '   ',
    };

    const partial = buildAdminStudentUpdatePayload(formValues, SAMPLE_STUDENT);
    assert.deepEqual(partial, {
      contactNumber: '9876543219',
      className: 'Class 10',
      email: '',
    });

    const gmailPayload = buildAdminStudentUpdatePayload(
      {
        ...buildStudentEditFormValues(SAMPLE_STUDENT),
        email: '  First.Last+School@Gmail.COM  ',
      },
      SAMPLE_STUDENT
    );
    assert.deepEqual(gmailPayload, {
      email: 'first.last+school@gmail.com',
    });
  });

  test('12. Detects unsaved changes accurately for close confirmation', () => {
    const initial = buildStudentEditFormValues(SAMPLE_STUDENT);
    assert.equal(hasUnsavedStudentEditChanges(initial, SAMPLE_STUDENT), false);

    assert.equal(
      hasUnsavedStudentEditChanges({ ...initial, className: 'Class 10' }, SAMPLE_STUDENT),
      true
    );
    assert.equal(
      hasUnsavedStudentEditChanges({ ...initial, fullName: '  Aarav Sharma  ' }, SAMPLE_STUDENT),
      false
    );
  });

  test('13. Classifies 400, 404, 409, and 500/network errors accurately', () => {
    assert.deepEqual(
      getStudentEditErrorDetails({
        response: { status: 400, data: { message: 'Invalid class' } },
      }),
      {
        status: 400,
        isConflict: false,
        isNotFound: false,
        message: 'Invalid class',
      }
    );

    assert.deepEqual(
      getStudentEditErrorDetails({ response: { status: 404 } }),
      {
        status: 404,
        isConflict: false,
        isNotFound: true,
        message: 'This student record no longer exists.',
      }
    );

    assert.deepEqual(
      getStudentEditErrorDetails({
        response: { status: 409, data: { message: 'Conflict detected' } },
      }),
      {
        status: 409,
        isConflict: true,
        isNotFound: false,
        message: 'Conflict detected',
      }
    );

    assert.deepEqual(getStudentEditErrorDetails(new Error('Network')), {
      status: 500,
      isConflict: false,
      isNotFound: false,
      message: 'Failed to save student changes. Please try again.',
    });
  });
});
