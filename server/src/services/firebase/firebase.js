import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const DEFAULT_PROJECT_ID = 'hisabbook-e2542'

/**
 * Safely parses the FIREBASE_SERVICE_ACCOUNT environment variable
 * or builds credentials from individual environment variables.
 *
 * @param {string|object} serviceAccountInput
 * @returns {object|null}
 */
function parseServiceAccount(serviceAccountInput) {
  let parsed = null

  if (serviceAccountInput) {
    if (typeof serviceAccountInput === 'object') {
      parsed = serviceAccountInput
    } else if (typeof serviceAccountInput === 'string') {
      const trimmed = serviceAccountInput.trim()
      if (trimmed) {
        try {
          parsed = JSON.parse(trimmed)
        } catch (e1) {
          try {
            const decoded = Buffer.from(trimmed, 'base64').toString('utf8')
            parsed = JSON.parse(decoded)
          } catch (e2) {
            console.warn('Firebase Admin SDK: Unable to parse FIREBASE_SERVICE_ACCOUNT environment variable.')
          }
        }
      }
    }
  }

  // Fallback to individual env vars if FIREBASE_SERVICE_ACCOUNT is not set/valid
  if (!parsed && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    parsed = {
      projectId: process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    }
  }

  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    if (typeof parsed.private_key === 'string') {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n')
    }
    if (typeof parsed.privateKey === 'string') {
      parsed.privateKey = parsed.privateKey.replace(/\\n/g, '\n')
    }
    return parsed
  }

  return null
}

let firebaseAdminApp = null
let _credentialed = false

const existingApps = getApps()

if (existingApps.length > 0) {
  firebaseAdminApp = existingApps[0]
  // Assume previously initialized app was credentialed
  _credentialed = true
} else {
  const targetProjectId = process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID
  try {
    const serviceAccount = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT)

    if (serviceAccount) {
      firebaseAdminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId || serviceAccount.project_id || targetProjectId,
      })
      _credentialed = true
      console.log(
        '[Firebase Admin] Initialized with service account credentials for project:',
        serviceAccount.projectId || serviceAccount.project_id || targetProjectId,
      )
    } else {
      // CRITICAL: No service account credentials found.
      // verifyIdToken() WILL FAIL in production without Application Default Credentials.
      // Set FIREBASE_SERVICE_ACCOUNT (JSON or base64) or FIREBASE_CLIENT_EMAIL +
      // FIREBASE_PRIVATE_KEY on Render to fix the 401 authentication failures.
      console.error(
        '[Firebase Admin] WARNING: No service account credentials found. ' +
        'FIREBASE_SERVICE_ACCOUNT env var is missing or could not be parsed. ' +
        'Token verification will fail in production environments without GCP Application Default Credentials. ' +
        'Set FIREBASE_SERVICE_ACCOUNT on Render to resolve 401 authentication errors.',
      )
      firebaseAdminApp = initializeApp({
        projectId: targetProjectId,
      })
      _credentialed = false
    }
  } catch (error) {
    console.error('[Firebase Admin] SDK initialization error:', error.message)
    firebaseAdminApp = initializeApp({
      projectId: targetProjectId,
    })
    _credentialed = false
  }
}

export const auth = getAuth(firebaseAdminApp)

/**
 * True when Firebase Admin was initialized with explicit service account
 * credentials (cert()). False means the app is relying on Application Default
 * Credentials, which will not be available on Render — causing 401 failures.
 */
export const isCredentialed = _credentialed

export default {
  auth: () => auth,
  app: firebaseAdminApp,
  isCredentialed: _credentialed,
}
