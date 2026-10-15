/**
 * auth.middleware.test.js
 *
 * Unit tests for the authenticateUser middleware.
 * Tests all 6 diagnostic stages without making real Firebase or MongoDB calls.
 * Uses the test-token fast-path (NODE_ENV=test + token prefix 'test_token_').
 */

// Must be set before importing middleware so the test_token_ fast-path activates
process.env.NODE_ENV = 'test'

import assert from 'node:assert'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '../models/User.js'
import { authenticateUser } from '../middleware/auth.middleware.js'

console.log('Running Auth Middleware Unit Tests...')

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeReq(overrides = {}) {
  return {
    method: 'POST',
    path: '/api/loans',
    headers: {},
    ...overrides,
  }
}

function makeRes() {
  const res = {
    _status: null,
    _body: null,
    status(code) {
      this._status = code
      return this
    },
    json(body) {
      this._body = body
      return this
    },
  }
  return res
}

// ─── test runner ──────────────────────────────────────────────────────────────

async function runTests() {
  // Set up in-memory MongoDB so User.findOne / User.create work
  let mongoServer = null
  try {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  } catch (err) {
    console.warn('MongoMemoryServer skipped:', err.message)
    // Provide minimal stubs if mongo init fails
    User.findOne = async () => null
    User.create = async (data) => ({ ...data, _id: new mongoose.Types.ObjectId() })
  }

  // ── Test 1: Missing Authorization header → 401 stage=missing-header ──────────
  {
    const req = makeReq({ headers: {} })
    const res = makeRes()
    let nextCalled = false
    await authenticateUser(req, res, () => { nextCalled = true })
    assert.strictEqual(res._status, 401, 'T1: status must be 401')
    assert.ok(res._body.message.includes('Authorization'), 'T1: message must mention Authorization')
    assert.strictEqual(nextCalled, false, 'T1: next must not be called')
    console.log('✓ T1: Missing Authorization header returns 401')
  }

  // ── Test 2: Malformed header (no Bearer prefix) → 401 ────────────────────────
  {
    const req = makeReq({ headers: { authorization: 'Token xyz' } })
    const res = makeRes()
    let nextCalled = false
    await authenticateUser(req, res, () => { nextCalled = true })
    assert.strictEqual(res._status, 401, 'T2: status must be 401')
    assert.strictEqual(nextCalled, false, 'T2: next must not be called')
    console.log('✓ T2: Non-Bearer Authorization header returns 401')
  }

  // ── Test 3: Empty token after Bearer prefix → 401 ────────────────────────────
  {
    const req = makeReq({ headers: { authorization: 'Bearer ' } })
    const res = makeRes()
    let nextCalled = false
    await authenticateUser(req, res, () => { nextCalled = true })
    assert.strictEqual(res._status, 401, 'T3: status must be 401')
    assert.ok(res._body.message.toLowerCase().includes('empty'), 'T3: message must mention empty token')
    assert.strictEqual(nextCalled, false, 'T3: next must not be called')
    console.log('✓ T3: Empty Bearer token returns 401')
  }

  // ── Test 4: Valid test_token → 200 (user created, next() called) ─────────────
  {
    const testUid = 'middleware_test_uid_001'
    const req = makeReq({ headers: { authorization: `Bearer test_token_${testUid}` } })
    const res = makeRes()
    let nextCalled = false
    await authenticateUser(req, res, () => { nextCalled = true })
    assert.strictEqual(nextCalled, true, 'T4: next() must be called for valid test token')
    assert.ok(req.user, 'T4: req.user must be populated')
    assert.strictEqual(req.user.firebaseUid, testUid, 'T4: req.user.firebaseUid must match test uid')
    assert.ok(req.user.id, 'T4: req.user.id (MongoDB _id) must be present')
    console.log('✓ T4: Valid test token passes authentication and populates req.user')
  }

  // ── Test 5: Second request with same testUid → existing user found (no duplicate) ─
  {
    const testUid = 'middleware_test_uid_001'
    const req = makeReq({ headers: { authorization: `Bearer test_token_${testUid}` } })
    const res = makeRes()
    let nextCalled = false
    await authenticateUser(req, res, () => { nextCalled = true })
    assert.strictEqual(nextCalled, true, 'T5: next() must be called on repeat request')

    // Verify only one document was created for this uid
    const count = await User.countDocuments({ firebaseUid: testUid })
    assert.strictEqual(count, 1, 'T5: Only one User document should exist for this firebaseUid')
    console.log('✓ T5: Repeat authentication reuses existing User document (no duplicate)')
  }

  // ── Test 6: Ownership is scoped correctly — different uid yields different user ─
  {
    const testUidA = 'middleware_test_uid_A'
    const testUidB = 'middleware_test_uid_B'

    const reqA = makeReq({ headers: { authorization: `Bearer test_token_${testUidA}` } })
    const reqB = makeReq({ headers: { authorization: `Bearer test_token_${testUidB}` } })
    const resA = makeRes()
    const resB = makeRes()

    await authenticateUser(reqA, resA, () => {})
    await authenticateUser(reqB, resB, () => {})

    assert.notStrictEqual(reqA.user.id, reqB.user.id, 'T6: Different UIDs must produce different MongoDB user IDs')
    assert.strictEqual(reqA.user.firebaseUid, testUidA)
    assert.strictEqual(reqB.user.firebaseUid, testUidB)
    console.log('✓ T6: Different Firebase UIDs produce distinct MongoDB users (ownership isolation confirmed)')
  }

  // ── Teardown ──────────────────────────────────────────────────────────────────
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect()
  }
  if (mongoServer) {
    await mongoServer.stop()
  }

  console.log('\n🎉 All Auth Middleware Tests Passed!\n')
  process.exit(0)
}

runTests().catch((err) => {
  console.error('Auth middleware test failure:', err)
  process.exit(1)
})
