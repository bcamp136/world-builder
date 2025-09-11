import { useState } from 'react'
import { Button, Loader } from '@mantine/core'
import { useStripe } from '@stripe/react-stripe-js'
import { notifications } from '@mantine/notifications'
import { createCheckoutSession } from '../lib/stripe'

interface CheckoutButtonProps {
  priceId: string
  customerId?: string
  planName: string
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  priceId,
  customerId,
  planName,
}) => {
  const stripe = useStripe()
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    if (!stripe) {
      notifications.show({
        title: 'Payment Unavailable',
        message: 'Payments not initialized. Missing or invalid publishable key.',
        color: 'yellow',
      })
      return
    }

    if (!priceId) {
      notifications.show({
        title: 'Configuration Error',
        message: 'Price ID not configured for this plan.',
        color: 'red',
      })
      return
    }

    setIsLoading(true)

    try {
      // Create a checkout session
      const session = await createCheckoutSession(priceId, customerId)

      if (!session || !session.url) {
        throw new Error('Failed to create checkout session')
      }

      // Redirect to the checkout page
      window.location.href = session.url
    } catch (error) {
      console.error('Error starting checkout:', error)
      notifications.show({
        title: 'Error',
        message: 'There was an error starting the checkout process. Please try again.',
        color: 'red',
      })
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      loading={isLoading}
      disabled={!stripe || isLoading || !priceId}
      color="blue"
      size="md"
      fullWidth
      variant={!stripe ? 'light' : 'filled'}
    >
      {isLoading ? (
        <Loader size="sm" />
      ) : !stripe ? (
        'Payments Unavailable'
      ) : (
        `Subscribe to ${planName}`
      )}
    </Button>
  )
}
