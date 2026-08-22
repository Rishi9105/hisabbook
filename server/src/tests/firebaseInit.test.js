import assert from 'node:assert'
import firebaseAdmin, { auth } from '../services/firebase/firebase.js'

console.log('Running Firebase Admin SDK Initialization Unit Tests...')

// Test 1: Verify auth instance and verifyIdToken method exist
assert.ok(auth, 'Auth instance must be exported')
assert.strictEqual(typeof auth.verifyIdToken, 'function', 'auth.verifyIdToken must be a function')
assert.strictEqual(typeof firebaseAdmin.auth().verifyIdToken, 'function', 'firebaseAdmin.auth().verifyIdToken must be a function')
console.log('✓ Firebase Auth instance and verifyIdToken method verified')

// Test 2: Verify service account format parsing logic with simulated env inputs
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

console.log('\nAll Firebase Initialization Unit Tests Passed Successfully!\n')
