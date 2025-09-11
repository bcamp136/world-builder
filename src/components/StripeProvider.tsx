import React, { useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '../lib/stripe'

interface StripeProviderProps {
  children: React.ReactNode
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof getStripe>>()

  useEffect(() => {
    setStripePromise(getStripe())
  }, [])

  if (!stripePromise) return null // initial mount

  return <Elements stripe={stripePromise}>{children}</Elements>
}
