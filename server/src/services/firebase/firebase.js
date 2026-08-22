import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

/**
 * Safely parses the FIREBASE_SERVICE_ACCOUNT environment variable.
 * Supports:
 * - JSON object (if set programmatically)
 * - Standard JSON string
 * - Base64 encoded JSON string
 * - Correctly converts escaped '\\n' in private_key to real newline characters '\n'
 *
 * @param {string|object} serviceAccountInput
 * @returns {object|null}
 */
function parseServiceAccount(serviceAccountInput) {
  if (!serviceAccountInput) return null

  let parsed = null

  if (typeof serviceAccountInput === 'object') {
    parsed = serviceAccountInput
  } else if (typeof serviceAccountInput === 'string') {
    const trimmed = serviceAccountInput.trim()
    if (!trimmed) return null

    try {
      parsed = JSON.parse(trimmed)
    } catch (e1) {
      try {
        const decoded = Buffer.from(trimmed, 'base64').toString('utf8')
        parsed = JSON.parse(decoded)
      } catch (e2) {
        console.warn('Firebase Admin SDK: Unable to parse FIREBASE_SERVICE_ACCOUNT environment variable.')
        return null
      }
    }
  }

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    if (typeof parsed.private_key === 'string') {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n')
    }
    return parsed
  }

  return null
}

let firebaseAdminApp = null

const existingApps = getApps()

if (existingApps.length > 0) {
  firebaseAdminApp = existingApps[0]
} else {
  try {
    const serviceAccount = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT)

    if (serviceAccount) {
      firebaseAdminApp = initializeApp({
        credential: cert(serviceAccount),
      })
    } else if (process.env.FIREBASE_PROJECT_ID) {
      firebaseAdminApp = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      })
    } else {
      console.warn('Firebase Admin SDK initialized in dev mode (specify FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID in production)')
      firebaseAdminApp = initializeApp({
        projectId: 'hisabbook-dev',
      })
    }
  } catch (error) {
    console.error('Firebase Admin SDK initialization warning:', error.message)
    firebaseAdminApp = initializeApp({
      projectId: 'hisabbook-dev',
    })
  }
}

export const auth = getAuth(firebaseAdminApp)

export default {
  auth: () => auth,
  app: firebaseAdminApp,
}
