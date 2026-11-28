import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import StudentApplication, {
  APPLICATION_STATUSES,
  CLASS_OPTIONS,
  GENDER_OPTIONS,
} from '../../src/models/StudentApplication.js';

const getValidationError = async (doc) => {
  try {
    await doc.validate();
    return null;
  } catch (err) {
    return err;
  }
};

const buildValidPayload = (overrides = {}) => ({
  applicationNumber: 'APP-2026-0001',
  fullName: '  Aarav Kumar  ',
  dateOfBirth: '2015-05-14',
  gender: 'Male',
  fatherName: '  Rajesh Kumar  ',
  motherName: '  Sunita Devi  ',
  contactNumber: '9876543210',
  classApplyingFor: 'Class 5',
  ...overrides,
});

describe('StudentApplication Model Validation Tests', () => {
  test('1. Accepts valid registration data, trims strings, preserves contactNumber as String, and defaults status to Pending', async () => {
    const doc = new StudentApplication(buildValidPayload());
    await doc.validate();

    assert.equal(doc.fullName, 'Aarav Kumar');
    assert.equal(doc.fatherName, 'Rajesh Kumar');
    assert.equal(doc.motherName, 'Sunita Devi');
    assert.equal(doc.contactNumber, '9876543210');
    assert.equal(typeof doc.contactNumber, 'string');
    assert.equal(doc.classApplyingFor, 'Class 5');
    assert.equal(doc.status, 'Pending');
    assert.equal(doc.email, undefined);
    assert.deepEqual(doc.photo.toObject(), { url: '', public_id: '' });
  });

  test('2. Rejects missing or blank required fields', async () => {
    const emptyDoc = new StudentApplication({});
    const emptyErr = await getValidationError(emptyDoc);
    assert.ok(emptyErr, 'Expected validation error for empty document');

    const requiredFields = [
      'applicationNumber',
      'fullName',
      'dateOfBirth',
      'gender',
      'fatherName',
      'motherName',
      'contactNumber',
      'classApplyingFor',
    ];
    for (const field of requiredFields) {
      assert.ok(emptyErr.errors[field], `Expected required error for ${field}`);
    }

    const blankDoc = new StudentApplication(
      buildValidPayload({
        fullName: '   ',
        fatherName: '  ',
        motherName: '',
        contactNumber: '   ',
      })
    );
    const blankErr = await getValidationError(blankDoc);
    assert.ok(blankErr, 'Expected validation error for blank strings');
    assert.ok(blankErr.errors.fullName);
    assert.ok(blankErr.errors.fatherName);
    assert.ok(blankErr.errors.motherName);
    assert.ok(blankErr.errors.contactNumber);
  });

  test('3. Accepts all valid classes (Class 1 to Class 12) and rejects invalid class values', async () => {
    for (const cls of CLASS_OPTIONS) {
      const doc = new StudentApplication(buildValidPayload({ classApplyingFor: cls }));
      await doc.validate();
    }

    for (const invalidClass of ['Nursery', 'LKG', 'Class 0', 'Class 13', '10th']) {
      const doc = new StudentApplication(buildValidPayload({ classApplyingFor: invalidClass }));
      const err = await getValidationError(doc);
      assert.ok(err?.errors?.classApplyingFor, `Expected error for class "${invalidClass}"`);
    }
  });

  test('4. Accepts allowed genders and rejects invalid gender values', async () => {
    for (const gender of GENDER_OPTIONS) {
      const doc = new StudentApplication(buildValidPayload({ gender }));
      await doc.validate();
    }

    const doc = new StudentApplication(buildValidPayload({ gender: 'Unknown' }));
    const err = await getValidationError(doc);
    assert.ok(err?.errors?.gender, 'Expected validation error for invalid gender');
  });

  test('5. Rejects invalid date of birth and future date of birth, while allowing valid today/past dates', async () => {
    const invalidDateDoc = new StudentApplication(buildValidPayload({ dateOfBirth: 'not-a-date' }));
    const invalidErr = await getValidationError(invalidDateDoc);
    assert.ok(invalidErr?.errors?.dateOfBirth, 'Expected CastError/ValidationError for invalid date');

    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const futureDoc = new StudentApplication(buildValidPayload({ dateOfBirth: futureDate }));
    const futureErr = await getValidationError(futureDoc);
    assert.ok(futureErr?.errors?.dateOfBirth, 'Expected validation error for future date of birth');

    const todayIso = new Date().toISOString().slice(0, 10);
    const todayDoc = new StudentApplication(buildValidPayload({ dateOfBirth: todayIso }));
    await todayDoc.validate();
  });

  test('6. Enforces application status enum values and rejects invalid status', async () => {
    for (const status of APPLICATION_STATUSES) {
      const doc = new StudentApplication(buildValidPayload({ status }));
      await doc.validate();
    }

    const invalidStatusDoc = new StudentApplication(buildValidPayload({ status: 'Waitlisted' }));
    const err = await getValidationError(invalidStatusDoc);
    assert.ok(err?.errors?.status, 'Expected validation error for invalid status');
  });

  test('7. Supports optional email (lowercased & validated) and optional Cloudinary photo object', async () => {
    const doc = new StudentApplication(
      buildValidPayload({
        email: '  Parent.Name@Example.COM  ',
        photo: {
          url: 'https://res.cloudinary.com/demo/image/upload/v1/student.jpg',
          public_id: 'ss_global_school/students/student_1',
        },
      })
    );
    await doc.validate();
    assert.equal(doc.email, 'parent.name@example.com');
    assert.equal(doc.photo.url, 'https://res.cloudinary.com/demo/image/upload/v1/student.jpg');
    assert.equal(doc.photo.public_id, 'ss_global_school/students/student_1');

    const badEmailDoc = new StudentApplication(buildValidPayload({ email: 'not-an-email' }));
    const emailErr = await getValidationError(badEmailDoc);
    assert.ok(emailErr?.errors?.email, 'Expected validation error for malformed email');
  });

  test('8. Strips unknown/unwanted fields via strict schema', async () => {
    const doc = new StudentApplication(
      buildValidPayload({
        previousSchoolName: 'Old School',
        guardianName: 'Uncle Name',
        alternateContactNumber: '9999999999',
        address: 'Some Street',
      })
    );
    await doc.validate();

    const obj = doc.toObject();
    assert.equal('previousSchoolName' in obj, false);
    assert.equal('guardianName' in obj, false);
    assert.equal('alternateContactNumber' in obj, false);
    assert.equal('address' in obj, false);
  });

  test('9. Validates reviewHistory entries and rejects invalid actorType', async () => {
    const adminId = new mongoose.Types.ObjectId();
    const doc = new StudentApplication(
      buildValidPayload({
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: 'Verified birth certificate',
        reviewHistory: [
          {
            action: 'SUBMITTED',
            actorType: 'Applicant',
            note: 'Initial public submission',
            changedFields: [],
          },
          {
            action: 'CORRECTION_REQUESTED',
            performedBy: adminId,
            actorType: 'Staff',
            note: 'Please clarify spelling of fatherName',
            changedFields: ['fatherName'],
          },
        ],
      })
    );
    await doc.validate();
    assert.equal(doc.reviewHistory.length, 2);
    assert.ok(doc.reviewHistory[0].timestamp instanceof Date);

    const invalidActorDoc = new StudentApplication(
      buildValidPayload({
        reviewHistory: [
          {
            action: 'UPDATED',
            actorType: 'Parent',
            note: 'Invalid actor type',
          },
        ],
      })
    );
    const err = await getValidationError(invalidActorDoc);
    assert.ok(
      err?.errors?.['reviewHistory.0.actorType'],
      'Expected validation error for invalid reviewHistory actorType'
    );
  });

  test('10. Defines unique applicationNumber index and query indexes', () => {
    const indexes = StudentApplication.schema.indexes();
    const appNumIndex = indexes.find(([fields]) => fields.applicationNumber === 1);
    assert.ok(appNumIndex, 'Expected index on applicationNumber');
    assert.equal(appNumIndex[1].unique, true);

    const statusClassIndex = indexes.find(
      ([fields]) => fields.status === 1 && fields.classApplyingFor === 1 && fields.createdAt === -1
    );
    assert.ok(statusClassIndex, 'Expected compound index on status, classApplyingFor, createdAt');
  });

  test('11. Validates Indian mobile numbers, name lengths, and Gmail dot/plus preservation consistently', async () => {
    const formattedDoc = new StudentApplication(
      buildValidPayload({
        contactNumber: '(+91) 98765-43210',
        email: '  Sanesh.Gupta+School@gmail.com  ',
      })
    );
    await formattedDoc.validate();
    assert.equal(formattedDoc.contactNumber, '9876543210');
    assert.equal(typeof formattedDoc.contactNumber, 'string');
    assert.equal(formattedDoc.email, 'sanesh.gupta+school@gmail.com');

    for (const badPhone of ['1234567890', '987654321', '98765432101', '98765abc10', '+1 9876543210']) {
      const err = await getValidationError(new StudentApplication(buildValidPayload({ contactNumber: badPhone })));
      assert.ok(err?.errors?.contactNumber, `Expected error for invalid contactNumber "${badPhone}"`);
    }

    for (const field of ['fullName', 'fatherName', 'motherName']) {
      const tooShortErr = await getValidationError(new StudentApplication(buildValidPayload({ [field]: 'A' })));
      assert.ok(tooShortErr?.errors?.[field], `Expected min length error for ${field}`);

      const tooLongErr = await getValidationError(
        new StudentApplication(buildValidPayload({ [field]: 'A'.repeat(101) }))
      );
      assert.ok(tooLongErr?.errors?.[field], `Expected max length error for ${field}`);
    }
  });
});
