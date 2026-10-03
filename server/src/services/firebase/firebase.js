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

const existingApps = getApps()

if (existingApps.length > 0) {
  firebaseAdminApp = existingApps[0]
} else {
  const targetProjectId = process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID
  try {
    const serviceAccount = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT)

    if (serviceAccount) {
      firebaseAdminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.projectId || serviceAccount.project_id || targetProjectId,
      })
    } else {
      firebaseAdminApp = initializeApp({
        projectId: targetProjectId,
      })
    }
  } catch (error) {
    console.error('Firebase Admin SDK initialization warning:', error.message)
    firebaseAdminApp = initializeApp({
      projectId: targetProjectId,
    })
  }
}

export const auth = getAuth(firebaseAdminApp)

export default {
  auth: () => auth,
  app: firebaseAdminApp,
}
