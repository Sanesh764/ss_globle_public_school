import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import mongoose from 'mongoose';
import Student from '../../src/models/Student.js';
import StudentApplication from '../../src/models/StudentApplication.js';
import {
  buildSeedStudentSpecs,
  parseCliOptions,
  isDeterministicTestRecord,
  resolveBackendEnvPath,
  loadBackendEnv,
} from '../../scripts/seedAttendanceTestStudents.js';

describe('Attendance Test Student Seed Script Tests', () => {
  test('1. Generates exactly 20 deterministic synthetic students (10 Class 8, 10 Class 9)', () => {
    const specs = buildSeedStudentSpecs();
    assert.equal(specs.length, 20);

    const class8 = specs.filter((s) => s.className === 'Class 8');
    const class9 = specs.filter((s) => s.className === 'Class 9');
    assert.equal(class8.length, 10);
    assert.equal(class9.length, 10);

    assert.equal(class8[0].admissionNumber, 'TEST-ATT-08-001');
    assert.equal(class8[9].admissionNumber, 'TEST-ATT-08-010');
    assert.equal(class9[0].admissionNumber, 'TEST-ATT-09-001');
    assert.equal(class9[9].admissionNumber, 'TEST-ATT-09-010');

    const uniqueAdm = new Set(specs.map((s) => s.admissionNumber));
    const uniqueApp = new Set(specs.map((s) => s.applicationNumber));
    assert.equal(uniqueAdm.size, 20);
    assert.equal(uniqueApp.size, 20);
  });

  test('2. Every generated student and application satisfies Mongoose schema validation without photos', () => {
    const specs = buildSeedStudentSpecs();
    const adminId = new mongoose.Types.ObjectId();
    const now = new Date();

    for (const spec of specs) {
      assert.equal(
        isDeterministicTestRecord(spec.admissionNumber, spec.applicationNumber),
        true
      );

      const appDoc = new StudentApplication({
        applicationNumber: spec.applicationNumber,
        fullName: spec.fullName,
        dateOfBirth: spec.dateOfBirth,
        gender: spec.gender,
        fatherName: spec.fatherName,
        motherName: spec.motherName,
        contactNumber: spec.contactNumber,
        classApplyingFor: spec.className,
        email: spec.email,
        photo: { url: '', public_id: '' },
        status: 'Approved',
        reviewedBy: adminId,
        reviewedAt: now,
      });
      assert.equal(appDoc.validateSync(), undefined);

      const studentDoc = new Student({
        fullName: spec.fullName,
        dateOfBirth: spec.dateOfBirth,
        gender: spec.gender,
        fatherName: spec.fatherName,
        motherName: spec.motherName,
        contactNumber: spec.contactNumber,
        className: spec.className,
        email: spec.email,
        photo: { url: '', public_id: '' },
        admissionNumber: spec.admissionNumber,
        sourceApplicationId: appDoc._id,
        applicationNumber: spec.applicationNumber,
        admittedBy: adminId,
        admittedAt: now,
        isActive: true,
      });
      assert.equal(studentDoc.validateSync(), undefined);
      assert.equal(studentDoc.isActive, true);
      assert.equal(studentDoc.photo.url, '');
      assert.equal(studentDoc.photo.public_id, '');
    }
  });

  test('3. Rejects non-test identifiers and safely parses CLI flags with dry-run default', () => {
    assert.equal(isDeterministicTestRecord('SSG-2026-0001', 'APP-2026-0001'), false);
    assert.equal(isDeterministicTestRecord('TEST-ATT-08-001', 'APP-2026-0001'), false);

    assert.deepEqual(parseCliOptions([]), { mode: 'dry-run', confirmDelete: false });
    assert.deepEqual(parseCliOptions(['--dry-run']), { mode: 'dry-run', confirmDelete: false });
    assert.deepEqual(parseCliOptions(['--apply']), { mode: 'apply', confirmDelete: false });
    assert.deepEqual(parseCliOptions(['--delete', '--confirm']), {
      mode: 'delete',
      confirmDelete: true,
    });
    assert.throws(() => parseCliOptions(['--apply', '--delete']), /Cannot combine/);
  });

  test('4. Resolves backend/.env relative to script regardless of working directory and errors clearly if missing', () => {
    const resolved = resolveBackendEnvPath();
    assert.equal(path.basename(resolved), '.env');
    assert.equal(path.basename(path.dirname(resolved)), 'backend');

    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-env-test-'));
    try {
      process.chdir(tmpDir);
      assert.equal(resolveBackendEnvPath(), resolved);

      const missingPath = path.join(tmpDir, 'nonexistent.env');
      assert.throws(
        () => loadBackendEnv({ envPath: missingPath, required: true }),
        (err) =>
          err instanceof Error &&
          err.message.includes('Backend environment file not found') &&
          err.message.includes(missingPath)
      );

      const validEnvPath = path.join(tmpDir, '.env');
      fs.writeFileSync(validEnvPath, 'SEED_TEST_ENV_KEY=ok_value\n', 'utf8');
      const res = loadBackendEnv({ envPath: validEnvPath, required: true });
      assert.equal(res.loaded, true);
      assert.equal(process.env.SEED_TEST_ENV_KEY, 'ok_value');
      delete process.env.SEED_TEST_ENV_KEY;
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
