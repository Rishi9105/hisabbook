import admin from 'firebase-admin'

// Initialize Firebase Admin SDK
let firebaseAdminApp = null

try {
  const apps = admin.apps || []
  if (!apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    } else if (process.env.FIREBASE_PROJECT_ID) {
      firebaseAdminApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      })
    } else {
      // Safe fallback initialization for development setup
      console.warn('Firebase Admin SDK initialized in dev mode (specify FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID in production)')
      firebaseAdminApp = admin.initializeApp({
        projectId: 'hisabbook-dev',
      })
    }
  } else {
    firebaseAdminApp = admin.apps[0]
  }
} catch (error) {
  console.error('Firebase Admin SDK initialization warning:', error.message)
}

export default admin
