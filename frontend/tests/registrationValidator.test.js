import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  CLASS_OPTIONS,
  GENDER_OPTIONS,
  STUDENT_PHOTO_MAX_SIZE_BYTES,
} from '../src/utils/constants.js';
import {
  validateStudentRegistration,
  normalizeIndianContactNumber,
  normalizeRegistrationEmail,
} from '../src/utils/registrationValidator.js';

const createMockFile = ({
  name = 'photo.jpg',
  type = 'image/jpeg',
  size = 1024,
} = {}) => ({ name, type, size });

const buildValidValues = (overrides = {}) => ({
  fullName: '  Aarav Sharma  ',
  dateOfBirth: '2015-05-14',
  gender: 'Male',
  fatherName: '  Vikram Sharma  ',
  motherName: '  Priya Sharma  ',
  contactNumber: '9876543210',
  classApplyingFor: 'Class 5',
  email: '',
  photo: null,
  ...overrides,
});

describe('Frontend Registration Constants & Validator Tests', () => {
  test('1. Returns empty error object for all valid required fields', () => {
    const errors = validateStudentRegistration(buildValidValues());
    assert.deepEqual(errors, {});
  });

  test('2-3. Rejects missing required fields and whitespace-only names', () => {
    const emptyErrors = validateStudentRegistration({});
    for (const field of [
      'fullName',
      'dateOfBirth',
      'gender',
      'fatherName',
      'motherName',
      'contactNumber',
      'classApplyingFor',
    ]) {
      assert.ok(emptyErrors[field], `Expected error for missing ${field}`);
    }

    const blankErrors = validateStudentRegistration(
      buildValidValues({
        fullName: '   ',
        fatherName: '  ',
        motherName: '   ',
      })
    );
    assert.ok(blankErrors.fullName);
    assert.ok(blankErrors.fatherName);
    assert.ok(blankErrors.motherName);
  });

  test('4-5. Enforces name minimum (2) and maximum (100) length boundaries', () => {
    assert.deepEqual(
      validateStudentRegistration(
        buildValidValues({
          fullName: 'Om',
          fatherName: 'A'.repeat(100),
          motherName: 'B'.repeat(2),
        })
      ),
      {}
    );

    for (const field of ['fullName', 'fatherName', 'motherName']) {
      const shortErr = validateStudentRegistration(buildValidValues({ [field]: 'A' }));
      assert.ok(shortErr[field], `Expected min length error for ${field}`);

      const longErr = validateStudentRegistration(
        buildValidValues({ [field]: 'A'.repeat(101) })
      );
      assert.ok(longErr[field], `Expected max length error for ${field}`);
    }
  });

  test('6-9. Validates past DOB, rejects invalid/future DOB, and handles Asia/Kolkata timezone boundary', () => {
    assert.deepEqual(
      validateStudentRegistration(buildValidValues({ dateOfBirth: '2012-01-15' })),
      {}
    );

    const invalidDob = validateStudentRegistration(buildValidValues({ dateOfBirth: 'not-a-date' }));
    assert.ok(invalidDob.dateOfBirth);

    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const futureDob = validateStudentRegistration(buildValidValues({ dateOfBirth: futureDate }));
    assert.ok(futureDob.dateOfBirth);

    // At 2026-12-31T18:30:00Z, it is 2027-01-01 00:00:00 in Asia/Kolkata -> 2027-01-01 is valid "today"
    const istNewYearMoment = new Date('2026-12-31T18:30:00.000Z');
    assert.deepEqual(
      validateStudentRegistration(buildValidValues({ dateOfBirth: '2027-01-01' }), {
        referenceNow: istNewYearMoment,
      }),
      {}
    );

    // 2027-01-02 is tomorrow in IST at that moment -> must be rejected
    const istTomorrowErr = validateStudentRegistration(
      buildValidValues({ dateOfBirth: '2027-01-02' }),
      { referenceNow: istNewYearMoment }
    );
    assert.ok(istTomorrowErr.dateOfBirth);
  });

  test('10-11. Accepts all GENDER_OPTIONS and rejects invalid gender', () => {
    assert.deepEqual(GENDER_OPTIONS, ['Male', 'Female', 'Other']);
    for (const gender of GENDER_OPTIONS) {
      assert.deepEqual(validateStudentRegistration(buildValidValues({ gender })), {});
    }

    const badGender = validateStudentRegistration(buildValidValues({ gender: 'Unknown' }));
    assert.ok(badGender.gender);
  });

  test('12-16. Validates 10-digit, +91, formatted Indian mobile numbers and rejects invalid lengths/chars', () => {
    for (const phone of ['9876543210', '+919876543210', '+91 98765-43210', '(+91) 88765 43210']) {
      assert.deepEqual(validateStudentRegistration(buildValidValues({ contactNumber: phone })), {});
      assert.equal(typeof normalizeIndianContactNumber(phone), 'string');
    }
    assert.equal(normalizeIndianContactNumber('+91 98765-43210'), '9876543210');

    for (const badPhone of ['987654321', '98765432101', '5876543210', '98765abc10', '+1 9876543210']) {
      const err = validateStudentRegistration(buildValidValues({ contactNumber: badPhone }));
      assert.ok(err.contactNumber, `Expected error for invalid mobile "${badPhone}"`);
    }
  });

  test('17-18. Accepts all 12 CLASS_OPTIONS and rejects invalid classes', () => {
    assert.equal(CLASS_OPTIONS.length, 12);
    assert.equal(CLASS_OPTIONS[0], 'Class 1');
    assert.equal(CLASS_OPTIONS[11], 'Class 12');

    for (const cls of CLASS_OPTIONS) {
      assert.deepEqual(validateStudentRegistration(buildValidValues({ classApplyingFor: cls })), {});
    }

    const badClass = validateStudentRegistration(buildValidValues({ classApplyingFor: 'Class 13' }));
    assert.ok(badClass.classApplyingFor);
  });

  test('19-22. Handles optional email, lowercases, preserves Gmail dots/plus-addressing, and rejects invalid email', () => {
    assert.deepEqual(validateStudentRegistration(buildValidValues({ email: '' })), {});
    assert.deepEqual(validateStudentRegistration(buildValidValues({ email: undefined })), {});

    assert.equal(
      normalizeRegistrationEmail('  Sanesh.Gupta+School@gmail.com  '),
      'sanesh.gupta+school@gmail.com'
    );

    assert.deepEqual(
      validateStudentRegistration(
        buildValidValues({ email: '  Sanesh.Gupta+School@gmail.com  ' })
      ),
      {}
    );

    const badEmail = validateStudentRegistration(buildValidValues({ email: 'not-an-email' }));
    assert.ok(badEmail.email);
  });

  test('23-28. Validates optional JPEG, PNG, WebP photos up to 2 MB and rejects invalid types/sizes', () => {
    assert.deepEqual(validateStudentRegistration(buildValidValues({ photo: null })), {});

    for (const validFile of [
      createMockFile({ name: 'a.jpg', type: 'image/jpeg', size: 1024 }),
      createMockFile({ name: 'b.png', type: 'image/png', size: 500_000 }),
      createMockFile({ name: 'c.webp', type: 'image/webp', size: STUDENT_PHOTO_MAX_SIZE_BYTES }),
    ]) {
      assert.deepEqual(validateStudentRegistration(buildValidValues({ photo: validFile })), {});
    }

    for (const badType of ['image/svg+xml', 'image/gif', 'application/pdf']) {
      const err = validateStudentRegistration(
        buildValidValues({ photo: createMockFile({ type: badType }) })
      );
      assert.ok(err.photo, `Expected error for photo MIME "${badType}"`);
    }

    const oversizedErr = validateStudentRegistration(
      buildValidValues({
        photo: createMockFile({ type: 'image/jpeg', size: STUDENT_PHOTO_MAX_SIZE_BYTES + 1 }),
      })
    );
    assert.ok(oversizedErr.photo);
  });
});
