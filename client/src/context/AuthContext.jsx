import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { updateProfile } from 'firebase/auth'
import {
  subscribeToAuth,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutUser,
} from '../services/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken()
          setToken(idToken)
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || '',
          })
        } catch (error) {
          console.error('Failed to get Firebase ID token:', error)
          setUser(null)
          setToken(null)
        }
      } else {
        setUser(null)
        setToken(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async ({ email, password }) => {
    const userCredential = await loginWithEmail(email, password)
    const idToken = await userCredential.user.getIdToken()
    setToken(idToken)
    const nextUser = {
      uid: userCredential.user.uid,
      name: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
      email: userCredential.user.email,
      photoURL: userCredential.user.photoURL || '',
    }
    setUser(nextUser)
    return nextUser
  }

  const register = async ({ name, email, password }) => {
    const userCredential = await registerWithEmail(email, password)
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name }).catch(() => {})
    }
    const idToken = await userCredential.user.getIdToken()
    setToken(idToken)
    const nextUser = {
      uid: userCredential.user.uid,
      name: name || userCredential.user.email?.split('@')[0] || 'User',
      email: userCredential.user.email,
      photoURL: userCredential.user.photoURL || '',
    }
    setUser(nextUser)
    return nextUser
  }

  const loginGoogle = async () => {
    const userCredential = await loginWithGoogle()
    const idToken = await userCredential.user.getIdToken()
    setToken(idToken)
    const nextUser = {
      uid: userCredential.user.uid,
      name: userCredential.user.displayName || 'Google User',
      email: userCredential.user.email,
      photoURL: userCredential.user.photoURL || '',
    }
    setUser(nextUser)
    return nextUser
  }

  const logout = async () => {
    await logoutUser()
    setUser(null)
    setToken(null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      loginGoogle,
      logout,
    }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
