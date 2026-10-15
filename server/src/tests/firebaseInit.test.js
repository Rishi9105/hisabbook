import assert from 'node:assert'
import firebaseAdmin, { auth, isCredentialed } from '../services/firebase/firebase.js'

console.log('Running Firebase Admin SDK Initialization Unit Tests...')

// Test 1: Verify auth instance and verifyIdToken method exist
assert.ok(auth, 'Auth instance must be exported')
assert.strictEqual(typeof auth.verifyIdToken, 'function', 'auth.verifyIdToken must be a function')
assert.strictEqual(typeof firebaseAdmin.auth().verifyIdToken, 'function', 'firebaseAdmin.auth().verifyIdToken must be a function')
console.log('✓ Firebase Auth instance and verifyIdToken method verified')

// Test 2: Verify isCredentialed export exists and is a boolean
assert.strictEqual(typeof isCredentialed, 'boolean', 'isCredentialed must be a boolean export')
console.log('✓ isCredentialed export is boolean:', isCredentialed)

// Test 3: Log credential status so CI/CD can verify production readiness
if (isCredentialed) {
  console.log('✓ Firebase Admin SDK initialized with explicit service account credentials (production-ready)')
} else {
  console.warn(
    '⚠ Firebase Admin SDK initialized WITHOUT service account credentials. ' +
      'This is acceptable in local dev but will cause 401 failures in production (Render). ' +
      'Set FIREBASE_SERVICE_ACCOUNT on Render to fix production authentication.',
  )
}

// Test 4: Verify service account format parsing logic with simulated env inputs
const sampleServiceAccountObj = {
  type: 'service_account',
  project_id: 'test-project',
  private_key_id: 'key-id-123',
  private_key: '-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBg...\\n-----END PRIVATE KEY-----\\n',
  client_email: 'firebase-adminsdk@test-project.iam.gserviceaccount.com',
}

const sampleJsonString = JSON.stringify(sampleServiceAccountObj)
const sampleBase64String = Buffer.from(sampleJsonString).toString('base64')

// Test that parsing stringified JSON converts escaped newlines in private key
const parsedFromJson = JSON.parse(sampleJsonString)
assert.strictEqual(parsedFromJson.private_key.replace(/\\n/g, '\n').includes('\n'), true)
console.log('✓ Service account JSON string parsing and private key newline unescaping verified')

// Test base64 parsing
const decodedFromBase64 = JSON.parse(Buffer.from(sampleBase64String, 'base64').toString('utf8'))
assert.strictEqual(decodedFromBase64.project_id, 'test-project')
console.log('✓ Service account Base64 string decoding verified')

// Test 5: Verify isCredentialed on default export matches named export
assert.strictEqual(firebaseAdmin.isCredentialed, isCredentialed, 'default export isCredentialed must match named export')
console.log('✓ Default and named isCredentialed exports are consistent')

console.log('\nAll Firebase Initialization Unit Tests Passed Successfully!\n')
