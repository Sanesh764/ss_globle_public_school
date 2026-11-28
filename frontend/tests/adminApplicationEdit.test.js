import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isApplicationEditable,
  formatDateForInput,
  buildEditFormValues,
  validateAdminApplicationEdit,
  buildAdminApplicationUpdatePayload,
  hasUnsavedEditChanges,
  EDIT_NOTE_MAX_LENGTH,
} from '../src/utils/adminApplicationEditUtils.js';

const SAMPLE_APPLICATION = {
  _id: 'app_1',
  applicationNumber: 'SSG-2026-A1B2C3D4E5F60718',
  fullName: 'Aarav Sharma',
  dateOfBirth: '2015-05-14T00:00:00.000Z',
  gender: 'Male',
  fatherName: 'Vikram Sharma',
  motherName: 'Priya Sharma',
  contactNumber: '9876543210',
  classApplyingFor: 'Class 5',
  email: 'Sanesh.Gupta+School@gmail.com',
  status: 'Pending',
  photo: {
    url: 'https://res.cloudinary.com/demo/image/upload/v1/stu.jpg',
    public_id: 'stu',
  },
};

describe('Admin Application Edit Utilities Tests', () => {
  test('1. Permits editing only for Pending and Correction Requested, and locks Approved/Rejected', () => {
    assert.equal(isApplicationEditable('Pending'), true);
    assert.equal(isApplicationEditable('Correction Requested'), true);
    assert.equal(isApplicationEditable('Approved'), false);
    assert.equal(isApplicationEditable('Rejected'), false);
    assert.equal(isApplicationEditable('Unknown'), false);
  });

  test('2. Formats ISO dates cleanly to YYYY-MM-DD for date input without timezone shift', () => {
    assert.equal(formatDateForInput('2015-05-14T00:00:00.000Z'), '2015-05-14');
    assert.equal(formatDateForInput('2015-05-14'), '2015-05-14');
    assert.equal(formatDateForInput(null), '');
    assert.equal(formatDateForInput('invalid'), '');
  });

  test('3. Prefills editable fields from fetched application and initializes empty internal note', () => {
    const formValues = buildEditFormValues(SAMPLE_APPLICATION);
    assert.deepEqual(formValues, {
      fullName: 'Aarav Sharma',
      dateOfBirth: '2015-05-14',
      gender: 'Male',
      fatherName: 'Vikram Sharma',
      motherName: 'Priya Sharma',
      contactNumber: '9876543210',
      classApplyingFor: 'Class 5',
      email: 'Sanesh.Gupta+School@gmail.com',
      note: '',
    });
  });

  test('4. Validates editable fields and internal edit note max length (500 chars)', () => {
    const valid = buildEditFormValues(SAMPLE_APPLICATION);
    assert.deepEqual(validateAdminApplicationEdit({ ...valid, note: 'Spelling updated' }), {});

    const invalidNote = validateAdminApplicationEdit({
      ...valid,
      note: 'A'.repeat(EDIT_NOTE_MAX_LENGTH + 1),
    });
    assert.ok(invalidNote.note);

    const invalidFields = validateAdminApplicationEdit({
      ...valid,
      fullName: 'A',
      contactNumber: '12345',
      classApplyingFor: 'Class 13',
      email: 'bad-email',
    });
    assert.ok(invalidFields.fullName);
    assert.ok(invalidFields.contactNumber);
    assert.ok(invalidFields.classApplyingFor);
    assert.ok(invalidFields.email);
  });

  test('5. Builds allowlisted PATCH payload, normalizes contact/email, and omits blank note', () => {
    const payload = buildAdminApplicationUpdatePayload({
      fullName: '  Aarav Verma  ',
      dateOfBirth: '2015-05-14',
      gender: 'Male',
      fatherName: '  Vikram Sharma  ',
      motherName: '  Priya Sharma  ',
      contactNumber: '+91 98765-43210',
      classApplyingFor: 'Class 6',
      email: '  Sanesh.Gupta+Edit@gmail.com  ',
      note: '  Verified birth certificate  ',
      status: 'Approved', // must not be included
      applicationNumber: 'CUSTOM', // must not be included
    });

    assert.deepEqual(payload, {
      fullName: 'Aarav Verma',
      dateOfBirth: '2015-05-14',
      gender: 'Male',
      fatherName: 'Vikram Sharma',
      motherName: 'Priya Sharma',
      contactNumber: '9876543210',
      classApplyingFor: 'Class 6',
      email: 'sanesh.gupta+edit@gmail.com',
      note: 'Verified birth certificate',
    });
    assert.equal('status' in payload, false);
    assert.equal('applicationNumber' in payload, false);

    const payloadWithoutNote = buildAdminApplicationUpdatePayload({
      ...buildEditFormValues(SAMPLE_APPLICATION),
      note: '   ',
    });
    assert.equal('note' in payloadWithoutNote, false);
  });

  test('6. Detects unsaved changes accurately for close confirmation', () => {
    const initial = buildEditFormValues(SAMPLE_APPLICATION);
    assert.equal(hasUnsavedEditChanges(initial, SAMPLE_APPLICATION), false);
    assert.equal(
      hasUnsavedEditChanges({ ...initial, fullName: 'Aarav Verma' }, SAMPLE_APPLICATION),
      true
    );
    assert.equal(
      hasUnsavedEditChanges({ ...initial, note: 'Added internal note' }, SAMPLE_APPLICATION),
      true
    );
  });
});
