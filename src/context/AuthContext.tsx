import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getFirebase } from '../lib/firebase'

interface AppUserProfile {
  uid: string
  email: string | null
  displayName?: string | null
  stripeCustomerId?: string
  createdAt?: number
}

interface AuthContextValue {
  user: AppUserProfile | null
  loading: boolean
  signup: (email: string, password: string, displayName?: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth, db } = getFirebase()
  const [user, setUser] = useState<AppUserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (firebaseUser: User) => {
    const ref = doc(db, 'users', firebaseUser.uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data() as AppUserProfile
      setUser({ ...data, uid: firebaseUser.uid })
    } else {
      const profile: AppUserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        createdAt: Date.now(),
      }
      await setDoc(ref, profile)
      setUser(profile)
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        try {
          await loadProfile(fbUser)
        } catch (e) {
          console.error('Failed to load profile', e)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [auth])

  const signup = async (email: string, password: string, displayName?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) {
      await updateProfile(cred.user, { displayName })
    }
    await loadProfile(cred.user)
  }

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    await loadProfile(cred.user)
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  const refreshProfile = async () => {
    if (auth.currentUser) {
      await loadProfile(auth.currentUser)
    }
  }

  const value: AuthContextValue = {
    user,
    loading,
    signup,
    login,
    logout,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
