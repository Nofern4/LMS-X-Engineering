import { isAllowedInstitutionalEmail, isUserStatusActive } from '../src/lib/auth';
import { enforceReadOnlyIfDirector, hasRole } from '../src/lib/rbac';

async function runSecurityTests() {
  console.log('🧪 Running มหาวิทยาลัย Xการช่าง Security & Policy Verification Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. External Email Domain Test for มหาวิทยาลัย Xการช่าง
  const allowedConfig = '@student.x-karchang.ac.th,@x-karchang.ac.th';
  const validStudent = isAllowedInstitutionalEmail('student@student.x-karchang.ac.th', allowedConfig);
  const validProf = isAllowedInstitutionalEmail('prof@x-karchang.ac.th', allowedConfig);
  const invalidGmail = isAllowedInstitutionalEmail('attacker@gmail.com', allowedConfig);
  const invalidYahoo = isAllowedInstitutionalEmail('user@yahoo.com', allowedConfig);

  assert(validStudent === true, 'Institutional Student Email (@student.x-karchang.ac.th) accepted');
  assert(validProf === true, 'Institutional Staff Email (@x-karchang.ac.th) accepted');
  assert(invalidGmail === false, 'External Email (@gmail.com) REJECTED');
  assert(invalidYahoo === false, 'External Email (@yahoo.com) REJECTED');

  // 2. User Status Active vs Graduated/Disabled Test
  assert(isUserStatusActive('ACTIVE') === true, 'ACTIVE status user allowed login');
  assert(isUserStatusActive('GRADUATED') === false, 'GRADUATED user blocked from login');
  assert(isUserStatusActive('INACTIVE') === false, 'INACTIVE user blocked from login');
  assert(isUserStatusActive('SUSPENDED') === false, 'SUSPENDED user blocked from login');
  assert(isUserStatusActive('DISABLED') === false, 'DISABLED user blocked from login');

  // 3. Director Role Read-Only Enforcement Test
  const directorUser = { id: 'd1', email: 'director@x-karchang.ac.th', name: 'Director', status: 'ACTIVE', roles: ['DIRECTOR'] };

  let directorPostBlocked = false;
  try {
    enforceReadOnlyIfDirector(directorUser, 'POST');
  } catch (err: any) {
    if (err.message.includes('DIRECTOR_READ_ONLY_VIOLATION')) {
      directorPostBlocked = true;
    }
  }

  let directorPatchBlocked = false;
  try {
    enforceReadOnlyIfDirector(directorUser, 'PATCH');
  } catch (err: any) {
    if (err.message.includes('DIRECTOR_READ_ONLY_VIOLATION')) {
      directorPatchBlocked = true;
    }
  }

  assert(directorPostBlocked === true, 'Director HTTP POST mutation blocked (Read-Only 100%)');
  assert(directorPatchBlocked === true, 'Director HTTP PATCH mutation blocked (Read-Only 100%)');

  // 4. RBAC Roles Separation Test (4 Core Roles)
  const studentUser = { id: 's1', email: 's@student.x-karchang.ac.th', name: 'Student', status: 'ACTIVE', roles: ['STUDENT'] };
  assert(hasRole(studentUser, 'STUDENT') === true, 'Student role has STUDENT permission');
  assert(hasRole(studentUser, 'PROFESSOR') === false, 'Student role DENIED PROFESSOR permission');
  assert(hasRole(studentUser, 'DIRECTOR') === false, 'Student role DENIED DIRECTOR permission');

  console.log(`\n📊 Security Test Results: ${passed} Passed, ${failed} Failed`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL CRITICAL SECURITY & BUSINESS RULE TESTS PASSED PERFECTLY!');
  }
}

runSecurityTests();
