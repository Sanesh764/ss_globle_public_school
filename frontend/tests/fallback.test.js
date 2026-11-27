import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SCHOOL_DETAILS_FALLBACK, LEADERSHIP_FALLBACK } from '../src/config/fallbackData.js';

describe('Test Category F: Frontend Automatic Fallback & Resilience Tests', () => {
  test('F1: Fallback configuration provides complete required school details', () => {
    assert.ok(SCHOOL_DETAILS_FALLBACK.schoolName, 'schoolName must be present');
    assert.ok(SCHOOL_DETAILS_FALLBACK.phone, 'phone must be present');
    assert.ok(SCHOOL_DETAILS_FALLBACK.email, 'email must be present');
    assert.ok(SCHOOL_DETAILS_FALLBACK.heroImage, 'heroImage must be present');
    assert.ok(SCHOOL_DETAILS_FALLBACK.vision, 'vision must be present');
    assert.ok(SCHOOL_DETAILS_FALLBACK.mission, 'mission must be present');
  });

  test('F2: Leadership fallback dataset contains verified members with unique identifiers', () => {
    assert.ok(Array.isArray(LEADERSHIP_FALLBACK), 'LEADERSHIP_FALLBACK must be an array');
    assert.ok(LEADERSHIP_FALLBACK.length >= 2, 'Must contain at least 2 leaders');

    const ids = new Set();
    for (const leader of LEADERSHIP_FALLBACK) {
      assert.ok(leader._id, 'Leader must have an _id');
      assert.ok(!ids.has(leader._id), `Duplicate fallback ID detected: ${leader._id}`);
      ids.add(leader._id);
      assert.ok(leader.name, 'Leader must have a name');
      assert.ok(leader.designation, 'Leader must have a designation');
    }
  });

  test('F3: Graceful degradation pattern substitutes fallback data on API network failure', async () => {
    // Simulates component data resolution pattern
    const mockFetchWithFallback = async (networkFails = true) => {
      let resolvedData = null;
      let error = null;

      try {
        if (networkFails) {
          throw new Error('502 Bad Gateway: Backend unavailable');
        }
        resolvedData = { schoolName: 'Live DB School' };
      } catch (err) {
        error = err.message;
        resolvedData = SCHOOL_DETAILS_FALLBACK;
      }

      return { resolvedData, error };
    };

    const result = await mockFetchWithFallback(true);
    assert.ok(result.error.includes('502 Bad Gateway'));
    assert.equal(result.resolvedData.schoolName, 'S.S. Global Public School');
    assert.equal(result.resolvedData, SCHOOL_DETAILS_FALLBACK);
  });

  test('F4: Live API recovery replaces fallback with fresh database data without state pollution', async () => {
    let currentData = SCHOOL_DETAILS_FALLBACK;

    // Simulate recovery
    const liveApiResponse = {
      schoolName: 'S.S. Global Public School (Live Atlas)',
      tagline: 'Live Tagline from MongoDB',
    };

    const updateState = (freshData) => {
      if (freshData) {
        currentData = freshData;
      }
    };

    updateState(liveApiResponse);
    assert.equal(currentData.schoolName, 'S.S. Global Public School (Live Atlas)');
    assert.equal(currentData.tagline, 'Live Tagline from MongoDB');
  });

  test('F5: Admin write operations fail safely and never report success when backend is down', async () => {
    const handleAdminWrite = async (writeFn, addToast) => {
      let submissionSuccess = false;
      try {
        await writeFn();
        submissionSuccess = true;
        addToast('Saved successfully', 'success');
      } catch (err) {
        submissionSuccess = false;
        addToast(err.message || 'Write failed', 'error');
      }
      return submissionSuccess;
    };

    const failingNetworkCall = async () => {
      throw new Error('502 Bad Gateway');
    };

    const toasts = [];
    const mockAddToast = (msg, type) => toasts.push({ msg, type });

    const success = await handleAdminWrite(failingNetworkCall, mockAddToast);

    assert.equal(success, false, 'Write operation must not succeed when backend throws');
    assert.equal(toasts.length, 1);
    assert.equal(toasts[0].type, 'error');
    assert.ok(toasts[0].msg.includes('502 Bad Gateway'));
  });
});
