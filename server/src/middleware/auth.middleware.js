import { auth } from '../services/firebase/firebase.js'
import User from '../models/User.js'

export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Authorization header with Bearer token is missing.',
      })
    }

    const token = authHeader.split('Bearer ')[1]?.trim()
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Token is empty.',
      })
    }

    let decodedToken = null

    // Environment specific test token support for automated testing suites only
    if (process.env.NODE_ENV === 'test' && token.startsWith('test_token_')) {
      const testUid = token.replace('test_token_', '')
      decodedToken = {
        uid: testUid,
        email: `${testUid}@hisabbook.test`,
        name: `Test User ${testUid}`,
      }
    } else {
      try {
        decodedToken = await auth.verifyIdToken(token)
      } catch (tokenError) {
        console.error('Firebase verifyIdToken error:', tokenError.code || tokenError.message)
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token',
        })
      }
    }

    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Invalid token payload.',
      })
    }

    // Find or sync User document in MongoDB tied to verified firebaseUid
    let dbUser = await User.findOne({ firebaseUid: decodedToken.uid })
    if (!dbUser) {
      dbUser = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || `${decodedToken.uid}@hisabbook.local`,
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        photoURL: decodedToken.picture || '',
      })
    }

    // Attach authenticated MongoDB user to req.user (Never trust client-supplied userId)
    req.user = {
      id: dbUser._id.toString(),
      _id: dbUser._id,
      firebaseUid: dbUser.firebaseUid,
      email: dbUser.email,
      name: dbUser.name,
    }

    next()
  } catch (error) {
    console.error('Authentication middleware error:', error.message)
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    })
  }
}
