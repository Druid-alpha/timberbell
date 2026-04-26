const buckets = new Map<string, { count: number; resetAt: number }>()

export function getRequestIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }

  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export function checkRateLimit(input: {
  key: string
  limit: number
  windowMs: number
}) {
  const now = Date.now()
  const existing = buckets.get(input.key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(input.key, { count: 1, resetAt: now + input.windowMs })
    return { ok: true, remaining: input.limit - 1, retryAfterSeconds: 0 }
  }

  if (existing.count >= input.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  buckets.set(input.key, existing)

  return {
    ok: true,
    remaining: Math.max(0, input.limit - existing.count),
    retryAfterSeconds: 0,
  }
}
