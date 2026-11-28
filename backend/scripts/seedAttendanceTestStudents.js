import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import Admin from '../src/models/Admin.js';
import Student from '../src/models/Student.js';
import StudentApplication from '../src/models/StudentApplication.js';
import Attendance from '../src/models/Attendance.js';

/**
 * Resolve backend/.env relative to this script file regardless of process.cwd().
 */
export const resolveBackendEnvPath = (scriptUrl = import.meta.url) => {
  const scriptDir = path.dirname(fileURLToPath(scriptUrl));
  return path.resolve(scriptDir, '..', '.env');
};

/**
 * Load environment variables explicitly from backend/.env without falling back
 * to unrelated .env files in the caller's current working directory.
 */
export const loadBackendEnv = ({
  envPath = resolveBackendEnvPath(),
  required = true,
} = {}) => {
  if (!fs.existsSync(envPath)) {
    if (required) {
      throw new Error(
        `Backend environment file not found at expected location: ${envPath}. Please ensure backend/.env exists.`
      );
    }
    return { loaded: false, envPath };
  }

  const result = dotenv.config({ path: envPath });
  if (result.error) {
    throw new Error(
      `Failed to load backend environment file at ${envPath}: ${result.error.message}`
    );
  }

  return { loaded: true, envPath };
};

const CLASS_8_FIRST_NAMES = [
  'Aarav',
  'Ananya',
  'Vihaan',
  'Ishita',
  'Reyansh',
  'Kavya',
  'Aditya',
  'Saanvi',
  'Kabir',
  'Meera',
];

const CLASS_9_FIRST_NAMES = [
  'Rohan',
  'Diya',
  'Arjun',
  'Niharika',
  'Vivaan',
  'Tanvi',
  'Siddharth',
  'Priya',
  'Karan',
  'Nandini',
];

const LAST_NAMES = [
  'Sharma',
  'Verma',
  'Patel',
  'Nair',
  'Iyer',
  'Gupta',
  'Rao',
  'Kulkarni',
  'Joshi',
  'Mishra',
];

export const TEST_ADMISSION_PREFIX = 'TEST-ATT-';
export const TEST_APPLICATION_PREFIX = 'APP-TEST-ATT-';

/**
 * Deterministically generate the 20 synthetic test student specifications
 * (10 for Class 8, 10 for Class 9).
 */
export const buildSeedStudentSpecs = () => {
  const specs = [];

  const createClassBatch = (className, classCode, firstNames, birthYear, phoneBase) => {
    for (let i = 0; i < 10; i += 1) {
      const seq = String(i + 1).padStart(3, '0');
      const admissionNumber = `${TEST_ADMISSION_PREFIX}${classCode}-${seq}`;
      const applicationNumber = `${TEST_APPLICATION_PREFIX}${classCode}-${seq}`;
      const lastName = LAST_NAMES[i % LAST_NAMES.length];
      const gender = i % 2 === 0 ? 'Male' : 'Female';
      const month = String((i % 9) + 1).padStart(2, '0');
      const day = String(10 + i).padStart(2, '0');

      specs.push({
        className,
        admissionNumber,
        applicationNumber,
        fullName: `${firstNames[i]} ${lastName} (Test)`,
        dateOfBirth: new Date(`${birthYear}-${month}-${day}T00:00:00.000Z`),
        gender,
        fatherName: `Rajesh ${lastName}`,
        motherName: `Sunita ${lastName}`,
        contactNumber: String(phoneBase + i + 1),
        email: `test.att.${classCode}.${seq}@example.invalid`,
      });
    }
  };

  createClassBatch('Class 8', '08', CLASS_8_FIRST_NAMES, 2012, 9800000800);
  createClassBatch('Class 9', '09', CLASS_9_FIRST_NAMES, 2011, 9800000900);

  return specs;
};

/**
 * Parse CLI arguments safely. Default mode is 'dry-run' (no database writes).
 */
export const parseCliOptions = (argv = []) => {
  const args = new Set(argv);
  const hasApply = args.has('--apply');
  const hasDelete = args.has('--delete');

  if (hasApply && hasDelete) {
    throw new Error('Cannot combine --apply and --delete in the same command.');
  }

  let mode = 'dry-run';
  if (hasApply) mode = 'apply';
  if (hasDelete) mode = 'delete';

  return {
    mode,
    confirmDelete: args.has('--confirm') || args.has('--yes'),
  };
};

/**
 * Verify whether an existing record matches our deterministic test identifiers.
 */
export const isDeterministicTestRecord = (admissionNumber, applicationNumber) =>
  typeof admissionNumber === 'string' &&
  admissionNumber.startsWith(TEST_ADMISSION_PREFIX) &&
  typeof applicationNumber === 'string' &&
  applicationNumber.startsWith(TEST_APPLICATION_PREFIX);

const findAdmittingAdmin = async () => {
  const preferredAdmin = await Admin.findOne(
    { isActive: true, role: { $in: ['superadmin', 'admin'] } },
    { _id: 1, name: 1, email: 1, role: 1 }
  )
    .sort({ createdAt: 1 })
    .lean();

  if (preferredAdmin) return preferredAdmin;

  return Admin.findOne(
    { isActive: true },
    { _id: 1, name: 1, email: 1, role: 1 }
  )
    .sort({ createdAt: 1 })
    .lean();
};

const runDryRun = (specs) => {
  const class8Count = specs.filter((s) => s.className === 'Class 8').length;
  const class9Count = specs.filter((s) => s.className === 'Class 9').length;

  console.log('[DRY RUN] No database changes will be made.');
  console.log(
    `[DRY RUN] Would ensure ${specs.length} synthetic test students exist (${class8Count} in Class 8, ${class9Count} in Class 9).`
  );
  console.log(
    `[DRY RUN] Identifiers: ${specs[0].admissionNumber} .. ${specs[9].admissionNumber} and ${specs[10].admissionNumber} .. ${specs[19].admissionNumber}`
  );
  console.log('[DRY RUN] Run with --apply to insert missing records, or --delete to remove them.');
};

const runApply = async (specs) => {
  const admittingAdmin = await findAdmittingAdmin();
  if (!admittingAdmin) {
    throw new Error(
      'No active Admin user found in the database for admittedBy. Create an Admin user first.'
    );
  }

  const admissionNumbers = specs.map((s) => s.admissionNumber);
  const applicationNumbers = specs.map((s) => s.applicationNumber);

  const [existingStudents, existingApps] = await Promise.all([
    Student.find(
      {
        $or: [
          { admissionNumber: { $in: admissionNumbers } },
          { applicationNumber: { $in: applicationNumbers } },
        ],
      },
      { _id: 1, admissionNumber: 1, applicationNumber: 1, className: 1 }
    ).lean(),
    StudentApplication.find(
      { applicationNumber: { $in: applicationNumbers } },
      { _id: 1, applicationNumber: 1, approvedStudentId: 1 }
    ).lean(),
  ]);

  const studentByAdm = new Map(existingStudents.map((s) => [s.admissionNumber, s]));
  const studentByApp = new Map(existingStudents.map((s) => [s.applicationNumber, s]));
  const appByNum = new Map(existingApps.map((a) => [a.applicationNumber, a]));

  // Collision check against non-test or mismatched records
  for (const spec of specs) {
    const byAdm = studentByAdm.get(spec.admissionNumber);
    const byApp = studentByApp.get(spec.applicationNumber);

    if (byAdm && byAdm.applicationNumber !== spec.applicationNumber) {
      throw new Error(
        `Collision detected for admissionNumber '${spec.admissionNumber}' with non-matching student record (${byAdm._id}). Aborting.`
      );
    }
    if (byApp && byApp.admissionNumber !== spec.admissionNumber) {
      throw new Error(
        `Collision detected for applicationNumber '${spec.applicationNumber}' with non-matching student record (${byApp._id}). Aborting.`
      );
    }
    const existingApp = appByNum.get(spec.applicationNumber);
    if (existingApp && !byAdm && existingApp.approvedStudentId) {
      throw new Error(
        `Orphaned application collision for '${spec.applicationNumber}' (${existingApp._id}). Aborting.`
      );
    }
  }

  let createdClass8 = 0;
  let createdClass9 = 0;
  let existingCount = 0;
  const errors = [];

  for (const spec of specs) {
    if (studentByAdm.has(spec.admissionNumber)) {
      existingCount += 1;
      continue;
    }

    try {
      const now = new Date();
      let appDoc = appByNum.get(spec.applicationNumber);

      if (!appDoc) {
        appDoc = await StudentApplication.create({
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
          reviewedBy: admittingAdmin._id,
          reviewedAt: now,
          reviewNotes: 'Synthetic attendance test seed record',
          reviewHistory: [
            {
              action: 'SUBMITTED',
              performedBy: null,
              actorType: 'System',
              message: 'Synthetic attendance test application created',
            },
            {
              action: 'APPROVED',
              performedBy: admittingAdmin._id,
              actorType: 'Admin',
              message: 'Approved for attendance testing',
            },
          ],
        });
      }

      const studentDoc = await Student.create({
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
        admittedBy: admittingAdmin._id,
        admittedAt: now,
        isActive: true,
      });

      await StudentApplication.updateOne(
        { _id: appDoc._id },
        { $set: { approvedStudentId: studentDoc._id } }
      );

      if (spec.className === 'Class 8') createdClass8 += 1;
      if (spec.className === 'Class 9') createdClass9 += 1;
    } catch (err) {
      errors.push(`${spec.admissionNumber}: ${err.message}`);
    }
  }

  const totalCreated = createdClass8 + createdClass9;
  console.log('--- Attendance Test Seed Summary ---');
  console.log(`Admitted By Admin: ${admittingAdmin.email} (${admittingAdmin.role})`);
  console.log(`Class 8 sample students created: ${createdClass8}`);
  console.log(`Class 9 sample students created: ${createdClass9}`);
  console.log(`Total existing test students: ${existingCount}`);
  console.log(`Total newly created test students: ${totalCreated}`);
  console.log(`Errors: ${errors.length}`);
  if (errors.length > 0) {
    for (const msg of errors) {
      console.error(`  - ${msg}`);
    }
    process.exitCode = 1;
  } else if (existingCount === specs.length) {
    console.log('All 20 synthetic attendance test students are already seeded.');
  }
};

const runDelete = async (specs, { confirmDelete }) => {
  const admissionNumbers = specs.map((s) => s.admissionNumber);
  const applicationNumbers = specs.map((s) => s.applicationNumber);

  const testStudents = await Student.find(
    {
      admissionNumber: { $in: admissionNumbers },
      applicationNumber: { $in: applicationNumbers },
    },
    { _id: 1, fullName: 1, admissionNumber: 1, applicationNumber: 1, className: 1 }
  ).lean();

  const safeTestStudents = testStudents.filter((s) =>
    isDeterministicTestRecord(s.admissionNumber, s.applicationNumber)
  );
  const testStudentIds = safeTestStudents.map((s) => s._id);

  const [attendanceCount, testApps] = await Promise.all([
    testStudentIds.length > 0
      ? Attendance.countDocuments({ studentId: { $in: testStudentIds } })
      : 0,
    StudentApplication.find(
      { applicationNumber: { $in: applicationNumbers } },
      { _id: 1, applicationNumber: 1 }
    ).lean(),
  ]);

  console.log('--- Attendance Test Data Deletion Preview ---');
  console.log(`Matching synthetic test students: ${safeTestStudents.length}`);
  for (const stu of safeTestStudents) {
    console.log(`  - ${stu.admissionNumber} | ${stu.className} | ${stu.fullName}`);
  }
  console.log(`Associated test attendance records: ${attendanceCount}`);
  console.log(`Associated synthetic applications: ${testApps.length}`);

  if (safeTestStudents.length === 0 && testApps.length === 0) {
    console.log('No synthetic attendance test records found to delete.');
    return;
  }

  if (!confirmDelete) {
    if (!process.stdin.isTTY) {
      throw new Error(
        'Destructive delete requires --confirm in non-interactive environments.'
      );
    }
    const rl = readline.createInterface({ input, output });
    try {
      const answer = await rl.question(
        'Type DELETE to confirm removing only these synthetic test records: '
      );
      if (answer.trim() !== 'DELETE') {
        console.log('Deletion cancelled. No records were modified.');
        return;
      }
    } finally {
      rl.close();
    }
  }

  const deletedAttendance =
    testStudentIds.length > 0
      ? await Attendance.deleteMany({ studentId: { $in: testStudentIds } })
      : { deletedCount: 0 };

  const deletedStudents =
    testStudentIds.length > 0
      ? await Student.deleteMany({ _id: { $in: testStudentIds } })
      : { deletedCount: 0 };

  const deletedApps =
    testApps.length > 0
      ? await StudentApplication.deleteMany({
          _id: { $in: testApps.map((a) => a._id) },
        })
      : { deletedCount: 0 };

  console.log('--- Deletion Complete ---');
  console.log(`Deleted Attendance records: ${deletedAttendance.deletedCount}`);
  console.log(`Deleted Student records: ${deletedStudents.deletedCount}`);
  console.log(`Deleted StudentApplication records: ${deletedApps.deletedCount}`);
};

const main = async () => {
  const options = parseCliOptions(process.argv.slice(2));
  const specs = buildSeedStudentSpecs();

  if (options.mode === 'dry-run') {
    runDryRun(specs);
    return;
  }

  loadBackendEnv({ required: true });
  await connectDB();
  try {
    if (options.mode === 'apply') {
      await runApply(specs);
    } else if (options.mode === 'delete') {
      await runDelete(specs, options);
    }
  } finally {
    await mongoose.disconnect();
  }
};

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  main().catch((err) => {
    console.error(`[Seed Error] ${err.message}`);
    process.exit(1);
  });
}
