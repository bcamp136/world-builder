import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { getFirebase } from './firebase'

export interface UserData {
  uid: string
  email: string | null
  displayName?: string | null
  stripeCustomerId?: string
  subscriptionId?: string
  subscriptionStatus?: string
  planType?: string
  createdAt?: number
  updatedAt?: number
}

const collection = 'users'

export async function getUser(uid: string): Promise<UserData | null> {
  const { db } = getFirebase()
  const ref = doc(db, collection, uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { uid, ...(snap.data() as Omit<UserData, 'uid'>) }
}

export async function createUser(data: UserData) {
  const { db } = getFirebase()
  const ref = doc(db, collection, data.uid)
  await setDoc(ref, { ...data, createdAt: Date.now(), updatedAt: Date.now() })
}

export async function updateUser(uid: string, data: Partial<UserData>) {
  const { db } = getFirebase()
  const ref = doc(db, collection, uid)
  await updateDoc(ref, { ...data, updatedAt: Date.now() })
}

export async function ensureStripeCustomer(uid: string, stripeCustomerId: string) {
  await updateUser(uid, { stripeCustomerId })
}
