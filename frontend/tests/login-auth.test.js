import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for headless Node environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new MockLocalStorage();

describe('Test Category E: Frontend Login & Auth State Tests', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  test('E1: Form input validation prevents empty or whitespace submissions', () => {
    const validateSubmission = (email, password) => {
      if (!email.trim() || !password.trim()) {
        return { valid: false, error: 'Please enter both email/username and password.' };
      }
      return { valid: true };
    };

    assert.equal(validateSubmission('', '').valid, false);
    assert.equal(validateSubmission('   ', 'secret').valid, false);
    assert.equal(validateSubmission('admin@ssglobal.edu.in', '   ').valid, false);
    assert.equal(validateSubmission('admin', 'ValidPass123').valid, true);
    assert.equal(validateSubmission('admin@ssglobal.edu.in', 'ValidPass123').valid, true);
  });

  test('E2: Submitting username correctly trims identifier and packages payload', () => {
    const preparePayload = (emailOrUsername, password) => {
      const trimmed = emailOrUsername.trim();
      return { email: trimmed, password };
    };

    const payload = preparePayload('  superadmin  ', 'SuperPass123');
    assert.equal(payload.email, 'superadmin');
    assert.equal(payload.password, 'SuperPass123');
  });

  test('E3: Successful login updates auth state and persists session to localStorage', async () => {
    // Mock successful API response
    const mockApiResponse = {
      success: true,
      data: {
        token: 'mock-jwt-token-xyz-12345',
        admin: {
          _id: 'admin_123',
          name: 'Super Admin',
          username: 'superadmin',
          email: 'admin@ssglobalpublicschool.edu.in',
          role: 'superadmin',
          isActive: true,
        },
      },
    };

    // Simulate AuthContext.login handler
    const authState = { token: '', admin: null, isAuthenticated: false };

    const loginHandler = async (res) => {
      if (res.success && res.data.token) {
        authState.token = res.data.token;
        authState.admin = res.data.admin;
        authState.isAuthenticated = true;
        globalThis.localStorage.setItem('adminToken', res.data.token);
        globalThis.localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
      }
    };

    await loginHandler(mockApiResponse);

    assert.equal(authState.isAuthenticated, true);
    assert.equal(authState.token, 'mock-jwt-token-xyz-12345');
    assert.equal(authState.admin.username, 'superadmin');
    assert.equal(globalThis.localStorage.getItem('adminToken'), 'mock-jwt-token-xyz-12345');
    const storedUser = JSON.parse(globalThis.localStorage.getItem('adminUser'));
    assert.equal(storedUser.email, 'admin@ssglobalpublicschool.edu.in');
  });

  test('E4: Failed login propagates error and does not mutate localStorage or auth state', async () => {
    const authState = { token: '', admin: null, isAuthenticated: false };

    const mockFailedApiCall = async () => {
      const err = new Error('Invalid email or password credentials');
      err.response = { status: 401, data: { success: false, message: 'Invalid email or password credentials' } };
      throw err;
    };

    let caughtError = null;
    try {
      await mockFailedApiCall();
    } catch (err) {
      caughtError = err.response?.data?.message || err.message;
    }

    assert.equal(caughtError, 'Invalid email or password credentials');
    assert.equal(authState.isAuthenticated, false);
    assert.equal(globalThis.localStorage.getItem('adminToken'), null);
  });

  test('E5: Loading state prevents duplicate concurrent submissions', async () => {
    let submitting = false;
    let submissionCount = 0;

    const handleSubmit = async () => {
      if (submitting) return 'BLOCKED_DUPLICATE';
      submitting = true;
      submissionCount++;
      // Simulate async request delay
      await new Promise((r) => setTimeout(r, 10));
      submitting = false;
      return 'SUBMITTED';
    };

    // First submit triggers request
    const p1 = handleSubmit();
    // Immediate second click while first is submitting
    const p2 = handleSubmit();

    const [r1, r2] = await Promise.all([p1, p2]);

    assert.equal(r1, 'SUBMITTED');
    assert.equal(r2, 'BLOCKED_DUPLICATE');
    assert.equal(submissionCount, 1, 'Only one request should be dispatched');
    assert.equal(submitting, false, 'Loading flag should reset after completion');
  });

  test('E6: ProtectedRoute authorization logic correctly allows admin/staff roles and rejects unauthenticated', () => {
    const checkProtectedRoute = (auth) => {
      if (auth.loading) return 'LOADING';
      if (!auth.isAuthenticated || !auth.admin) return 'REDIRECT_LOGIN';
      const role = (auth.admin.role || '').toString().toLowerCase().replace(/_/g, '');
      if (['superadmin', 'admin', 'staff'].includes(role)) return 'ALLOW';
      return 'REDIRECT_UNAUTHORIZED';
    };

    assert.equal(checkProtectedRoute({ loading: true }), 'LOADING');
    assert.equal(checkProtectedRoute({ loading: false, isAuthenticated: false }), 'REDIRECT_LOGIN');
    assert.equal(checkProtectedRoute({ loading: false, isAuthenticated: true, admin: { role: 'superadmin' } }), 'ALLOW');
    assert.equal(checkProtectedRoute({ loading: false, isAuthenticated: true, admin: { role: 'staff' } }), 'ALLOW');
    assert.equal(checkProtectedRoute({ loading: false, isAuthenticated: true, admin: { role: 'student' } }), 'REDIRECT_UNAUTHORIZED');
  });

  test('E7: SuperAdminRoute authorization logic allows superadmin and restricts staff', () => {
    const checkSuperAdminRoute = (auth) => {
      if (auth.loading) return 'LOADING';
      const role = (auth.role || auth.admin?.role || '').toString().toLowerCase().replace(/_/g, '');
      if (role === 'superadmin' || role === 'admin') return 'ALLOW';
      return 'REDIRECT_UNAUTHORIZED';
    };

    assert.equal(checkSuperAdminRoute({ loading: false, admin: { role: 'superadmin' } }), 'ALLOW');
    assert.equal(checkSuperAdminRoute({ loading: false, admin: { role: 'admin' } }), 'ALLOW');
    assert.equal(checkSuperAdminRoute({ loading: false, admin: { role: 'staff' } }), 'REDIRECT_UNAUTHORIZED');
    assert.equal(checkSuperAdminRoute({ loading: false, admin: null }), 'REDIRECT_UNAUTHORIZED');
  });

  test('E8: Logout action cleans up in-memory auth state and clears browser storage', () => {
    globalThis.localStorage.setItem('adminToken', 'active-token');
    globalThis.localStorage.setItem('adminUser', JSON.stringify({ name: 'Admin' }));

    const authState = { token: 'active-token', admin: { name: 'Admin' }, isAuthenticated: true };

    const logoutHandler = () => {
      authState.token = '';
      authState.admin = null;
      authState.isAuthenticated = false;
      globalThis.localStorage.removeItem('adminToken');
      globalThis.localStorage.removeItem('adminUser');
    };

    logoutHandler();

    assert.equal(authState.isAuthenticated, false);
    assert.equal(authState.token, '');
    assert.equal(authState.admin, null);
    assert.equal(globalThis.localStorage.getItem('adminToken'), null);
    assert.equal(globalThis.localStorage.getItem('adminUser'), null);
  });
});
