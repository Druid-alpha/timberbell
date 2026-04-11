import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY

if (!secretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment variables')
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2024-11-20.acacia',
})
