import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Student from '../../src/models/Student.js';
import { CLASS_OPTIONS, GENDER_OPTIONS } from '../../src/models/StudentApplication.js';

const getValidationError = async (doc) => {
  try {
    await doc.validate();
    return null;
  } catch (err) {
    return err;
  }
};

const buildValidStudentPayload = (overrides = {}) => ({
  fullName: '  Aarav Sharma  ',
  dateOfBirth: '2015-05-14',
  gender: 'Male',
  fatherName: '  Vikram Sharma  ',
  motherName: '  Priya Sharma  ',
  contactNumber: '9876543210',
  className: 'Class 5',
  sourceApplicationId: new mongoose.Types.ObjectId(),
  applicationNumber: 'SSG-2026-A1B2C3D4E5F60718',
  admittedBy: new mongoose.Types.ObjectId(),
  admittedAt: new Date(),
  ...overrides,
});

describe('Student Model Validation Tests', () => {
  test('1 & 14. Accepts valid permanent student data, trims strings, and defaults isActive to true', async () => {
    const doc = new Student(buildValidStudentPayload());
    await doc.validate();

    assert.equal(doc.fullName, 'Aarav Sharma');
    assert.equal(doc.fatherName, 'Vikram Sharma');
    assert.equal(doc.motherName, 'Priya Sharma');
    assert.equal(doc.contactNumber, '9876543210');
    assert.equal(typeof doc.contactNumber, 'string');
    assert.equal(doc.className, 'Class 5');
    assert.equal(doc.isActive, true);
    assert.equal(doc.email, undefined);
    assert.equal(doc.admissionNumber, undefined);
    assert.deepEqual(doc.photo.toObject(), { url: '', public_id: '' });
  });

  test('2 & 15. Rejects missing required student and admission metadata fields', async () => {
    const emptyErr = await getValidationError(new Student({}));
    assert.ok(emptyErr);

    const requiredFields = [
      'fullName',
      'dateOfBirth',
      'gender',
      'fatherName',
      'motherName',
      'contactNumber',
      'className',
      'sourceApplicationId',
      'admittedBy',
      'admittedAt',
    ];
    for (const field of requiredFields) {
      assert.ok(emptyErr.errors[field], `Expected required error for ${field}`);
    }
  });

  test('3. Accepts Class 1 through Class 12 and rejects invalid classes', async () => {
    for (const cls of CLASS_OPTIONS) {
      const doc = new Student(buildValidStudentPayload({ className: cls }));
      await doc.validate();
    }

    for (const badClass of ['Nursery', 'Class 0', 'Class 13']) {
      const err = await getValidationError(new Student(buildValidStudentPayload({ className: badClass })));
      assert.ok(err?.errors?.className, `Expected error for class "${badClass}"`);
    }
  });

  test('4. Accepts allowed genders and rejects invalid gender', async () => {
    for (const gender of GENDER_OPTIONS) {
      const doc = new Student(buildValidStudentPayload({ gender }));
      await doc.validate();
    }

    const err = await getValidationError(new Student(buildValidStudentPayload({ gender: 'Unknown' })));
    assert.ok(err?.errors?.gender);
  });

  test('5-6. Rejects invalid DOB and future DOB', async () => {
    const invalidErr = await getValidationError(
      new Student(buildValidStudentPayload({ dateOfBirth: 'not-a-date' }))
    );
    assert.ok(invalidErr?.errors?.dateOfBirth);

    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const futureErr = await getValidationError(
      new Student(buildValidStudentPayload({ dateOfBirth: futureDate }))
    );
    assert.ok(futureErr?.errors?.dateOfBirth);
  });

  test('7-8. Normalizes valid Indian mobile numbers and rejects invalid contact numbers', async () => {
    const formattedDoc = new Student(
      buildValidStudentPayload({ contactNumber: '(+91) 98765-43210' })
    );
    await formattedDoc.validate();
    assert.equal(formattedDoc.contactNumber, '9876543210');
    assert.equal(typeof formattedDoc.contactNumber, 'string');

    for (const badPhone of ['1234567890', '987654321', '98765abc10', '+1 9876543210']) {
      const err = await getValidationError(
        new Student(buildValidStudentPayload({ contactNumber: badPhone }))
      );
      assert.ok(err?.errors?.contactNumber, `Expected error for "${badPhone}"`);
    }
  });

  test('9-10. Supports optional email and preserves Gmail dots and plus-addressing', async () => {
    const doc = new Student(
      buildValidStudentPayload({ email: '  Sanesh.Gupta+Student@gmail.com  ' })
    );
    await doc.validate();
    assert.equal(doc.email, 'sanesh.gupta+student@gmail.com');

    const badEmailErr = await getValidationError(
      new Student(buildValidStudentPayload({ email: 'bad-email' }))
    );
    assert.ok(badEmailErr?.errors?.email);
  });

  test('11. Supports optional Cloudinary photo structure', async () => {
    const doc = new Student(
      buildValidStudentPayload({
        photo: {
          url: 'https://res.cloudinary.com/demo/image/upload/v1/ss_global_school/student_applications/stu.jpg',
          public_id: 'ss_global_school/student_applications/stu',
        },
      })
    );
    await doc.validate();
    assert.equal(
      doc.photo.url,
      'https://res.cloudinary.com/demo/image/upload/v1/ss_global_school/student_applications/stu.jpg'
    );
    assert.equal(doc.photo.public_id, 'ss_global_school/student_applications/stu');
  });

  test('12-13. Defines unique sourceApplicationId index, sparse unique admissionNumber index, and class/active index', () => {
    const indexes = Student.schema.indexes();

    const sourceAppIndex = indexes.find(([fields]) => fields.sourceApplicationId === 1);
    assert.ok(sourceAppIndex, 'Expected index on sourceApplicationId');
    assert.equal(sourceAppIndex[1].unique, true);

    const admNumIndex = indexes.find(([fields]) => fields.admissionNumber === 1);
    assert.ok(admNumIndex, 'Expected index on admissionNumber');
    assert.equal(admNumIndex[1].unique, true);
    assert.equal(admNumIndex[1].sparse, true);

    const classActiveIndex = indexes.find(
      ([fields]) => fields.className === 1 && fields.isActive === 1
    );
    assert.ok(classActiveIndex, 'Expected compound index on className and isActive');
  });

  test('16. Strips unexpected/unwanted fields via strict schema', async () => {
    const doc = new Student(
      buildValidStudentPayload({
        section: 'A',
        rollNumber: 12,
        previousSchoolName: 'Old School',
        guardianName: 'Uncle',
        address: 'Some Street',
      })
    );
    await doc.validate();

    const obj = doc.toObject();
    assert.equal('section' in obj, false);
    assert.equal('rollNumber' in obj, false);
    assert.equal('previousSchoolName' in obj, false);
    assert.equal('guardianName' in obj, false);
    assert.equal('address' in obj, false);
  });
});
