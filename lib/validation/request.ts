type ValidationSuccess<T> = {
  ok: true
  data: T
}

type ValidationFailure = {
  ok: false
  message: string
}

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

export function isNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
}

export function normalizeEmail(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

export function validateEmail(value: unknown) {
  const email = normalizeEmail(value)
  if (!email) return null
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

export function sanitizeMultilineText(value: unknown, maxLength: number) {
  const text = String(value || '').trim()
  return text.slice(0, maxLength)
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function validateRegisterPayload(body: any): ValidationResult<{
  email: string
  password: string
  name: string
  avatarUrl: string | null
}> {
  const email = validateEmail(body?.email)
  if (!email) {
    return { ok: false, message: 'A valid email is required' }
  }

  const password = String(body?.password || '')
  if (password.length < 8) {
    return { ok: false, message: 'Password must be at least 8 characters' }
  }

  const name = String(body?.name || [body?.firstName, body?.lastName].filter(Boolean).join(' ')).trim()
  if (!name) {
    return { ok: false, message: 'Name is required' }
  }

  return {
    ok: true,
    data: {
      email,
      password,
      name,
      avatarUrl: isNonEmptyString(body?.avatarUrl) ? String(body.avatarUrl).trim() : null,
    },
  }
}

export function validateLoginPayload(body: any): ValidationResult<{
  email: string
  password: string
}> {
  const email = validateEmail(body?.email)
  if (!email) {
    return { ok: false, message: 'A valid email is required' }
  }

  const password = String(body?.password || '')
  if (!password) {
    return { ok: false, message: 'Password is required' }
  }

  return {
    ok: true,
    data: { email, password },
  }
}

export function validateEmailPayload(body: any): ValidationResult<{ email: string }> {
  const email = validateEmail(body?.email)
  if (!email) {
    return { ok: false, message: 'A valid email is required' }
  }

  return { ok: true, data: { email } }
}

export function validateVerificationPayload(body: any): ValidationResult<
  | { token: string }
  | { email: string; code: string }
> {
  const token = String(body?.token || '').trim()
  if (token) {
    return { ok: true, data: { token } }
  }

  const email = validateEmail(body?.email)
  const code = String(body?.code || '').trim()
  if (!email || !/^\d{6}$/.test(code)) {
    return { ok: false, message: 'A valid email and 6-digit code are required' }
  }

  return { ok: true, data: { email, code } }
}

export function validatePasswordResetPayload(body: any): ValidationResult<{
  token: string
  password: string
}> {
  const token = String(body?.token || '').trim()
  if (!token) {
    return { ok: false, message: 'Token is required' }
  }

  const password = String(body?.password || '')
  if (password.length < 8) {
    return { ok: false, message: 'Password must be at least 8 characters' }
  }

  return { ok: true, data: { token, password } }
}

export function validateContactPayload(body: any): ValidationResult<{
  name: string
  email: string
  location: string
  message: string
}> {
  const name = String(body?.name || '').trim()
  if (!name) {
    return { ok: false, message: 'Name is required' }
  }

  const email = validateEmail(body?.email)
  if (!email) {
    return { ok: false, message: 'A valid email is required' }
  }

  const message = sanitizeMultilineText(body?.message, 5000)
  if (!message) {
    return { ok: false, message: 'Message is required' }
  }

  return {
    ok: true,
    data: {
      name: name.slice(0, 120),
      email,
      location: sanitizeMultilineText(body?.location, 120),
      message,
    },
  }
}

export function validateStudioIntakePayload(body: any): ValidationResult<{
  type: 'room_advisor' | 'trade'
  name: string
  email: string
  location: string
  projectType: string
  budget: string
  timeline: string
  message: string
}> {
  const type = body?.type === 'trade' ? 'trade' : body?.type === 'room_advisor' ? 'room_advisor' : null
  if (!type) {
    return { ok: false, message: 'A valid intake type is required' }
  }

  const contact = validateContactPayload(body)
  if (!contact.ok) {
    return contact
  }

  return {
    ok: true,
    data: {
      type,
      name: contact.data.name,
      email: contact.data.email,
      location: contact.data.location,
      projectType: sanitizeMultilineText(body?.projectType, 120),
      budget: sanitizeMultilineText(body?.budget, 120),
      timeline: sanitizeMultilineText(body?.timeline, 120),
      message: contact.data.message,
    },
  }
}
