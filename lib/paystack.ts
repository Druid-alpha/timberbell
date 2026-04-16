import 'server-only'

const PAYSTACK_BASE_URL = 'https://api.paystack.co'

function getSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured')
  }
  return secretKey
}

export function getPaystackPublicKey() {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''
}

export function getPaystackCurrency() {
  return process.env.PAYSTACK_CURRENCY || 'NGN'
}

async function paystackRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })

  const json = await response.json().catch(() => ({}))

  if (!response.ok || json?.status === false) {
    throw new Error(json?.message || 'Paystack request failed')
  }

  return json as T
}

export async function initializePaystackTransaction(input: {
  email: string
  amount: number
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}) {
  return paystackRequest<{
    status: boolean
    message: string
    data: {
      authorization_url: string
      access_code: string
      reference: string
    }
  }>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amount * 100),
      currency: getPaystackCurrency(),
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  })
}

export async function verifyPaystackTransaction(reference: string) {
  return paystackRequest<{
    status: boolean
    message: string
    data: {
      status: string
      reference: string
      amount: number
      paid_at?: string
      channel?: string
      gateway_response?: string
      customer?: { email?: string }
      metadata?: Record<string, unknown>
    }
  }>(`/transaction/verify/${encodeURIComponent(reference)}`)
}
