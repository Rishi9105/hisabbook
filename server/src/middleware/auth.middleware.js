import { auth, isCredentialed } from '../services/firebase/firebase.js'
import User from '../models/User.js'

export async function authenticateUser(req, res, next) {
  // Stage A: Check Authorization header presence and format
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('[AUTH stage=missing-header] No Authorization: Bearer header on', req.method, req.path)
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Authorization header with Bearer token is missing.',
    })
  }

  const token = authHeader.split('Bearer ')[1]?.trim()

  // Stage B: Empty token after Bearer prefix
  if (!token) {
    console.warn('[AUTH stage=empty-token] Bearer header present but token is empty on', req.method, req.path)
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Token is empty.',
    })
  }

  // Stage C: Warn if SDK is uncredentialed — this is the common production failure mode
  if (!isCredentialed && process.env.NODE_ENV !== 'test') {
    console.error(
      '[AUTH stage=uncredentialed-sdk] Firebase Admin SDK has no service account credentials. ' +
        'verifyIdToken() will fail. Set FIREBASE_SERVICE_ACCOUNT on Render.',
    )
  }

  let decodedToken = null

  // Environment-specific test token support for automated testing suites only
  if (process.env.NODE_ENV === 'test' && token.startsWith('test_token_')) {
    const testUid = token.replace('test_token_', '')
    decodedToken = {
      uid: testUid,
      email: `${testUid}@hisabbook.test`,
      name: `Test User ${testUid}`,
    }
  } else {
    // Stage D: Firebase token verification
    try {
      decodedToken = await auth.verifyIdToken(token)
    } catch (tokenError) {
      // Log structured diagnostic info — never log the token itself
      const errCode = tokenError.code || 'unknown'
      const errMsg = tokenError.message || ''

      if (errCode === 'auth/argument-error' || errMsg.includes('Decoding')) {
        // Malformed JWT — client is sending a bad token
        console.error('[AUTH stage=token-malformed] Firebase rejected token as malformed. code:', errCode)
      } else if (errCode === 'auth/id-token-expired') {
        console.warn('[AUTH stage=token-expired] Firebase ID token is expired. code:', errCode)
      } else if (errCode === 'auth/invalid-id-token') {
        console.error('[AUTH stage=token-invalid] Firebase ID token is invalid. code:', errCode)
      } else if (
        errCode === 'auth/project-not-found' ||
        errMsg.includes('project') ||
        errMsg.includes('audience') ||
        errMsg.includes('issuer')
      ) {
        // Project mismatch — Admin SDK project_id doesn't match the token's aud/iss
        console.error(
          '[AUTH stage=project-mismatch] Firebase token audience/issuer mismatch. ' +
            'Ensure FIREBASE_PROJECT_ID on Render matches the Firebase project used by the client. code:',
          errCode,
        )
      } else if (
        errMsg.includes('credential') ||
        errMsg.includes('UNAUTHENTICATED') ||
        errMsg.includes('Error fetching public keys') ||
        errCode === 'auth/internal-error'
      ) {
        // SDK credential failure — most likely FIREBASE_SERVICE_ACCOUNT not set on Render
        console.error(
          '[AUTH stage=sdk-credential-failure] Firebase Admin SDK lacks valid credentials to verify tokens. ' +
            'Set FIREBASE_SERVICE_ACCOUNT (service account JSON or base64) on Render. code:',
          errCode,
        )
      } else {
        console.error('[AUTH stage=token-verify-error] Firebase verifyIdToken failed. code:', errCode, 'message:', errMsg)
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
      })
    }
  }

  // Stage E: Validate decoded token has UID
  if (!decodedToken || !decodedToken.uid) {
    console.error('[AUTH stage=missing-uid] Token verified but UID is absent in decoded payload')
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid token payload.',
    })
  }

  // Stage F: Find or sync MongoDB user document
  try {
    let dbUser = await User.findOne({ firebaseUid: decodedToken.uid })
    if (!dbUser) {
      dbUser = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || `${decodedToken.uid}@hisabbook.local`,
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        photoURL: decodedToken.picture || '',
      })
      console.log('[AUTH stage=user-created] New MongoDB user synced for firebaseUid:', decodedToken.uid)
    }

    // Attach authenticated MongoDB user — never trust client-supplied userId
    req.user = {
      id: dbUser._id.toString(),
      _id: dbUser._id,
      firebaseUid: dbUser.firebaseUid,
      email: dbUser.email,
      name: dbUser.name,
    }

    next()
  } catch (dbError) {
    console.error('[AUTH stage=db-error] MongoDB user lookup/create failed:', dbError.message)
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    })
  }
}
