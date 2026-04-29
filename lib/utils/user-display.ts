type UserDisplaySource = {
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}

function toTitleWord(value: string) {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

function formatEmailSeed(email?: string | null) {
  const localPart = String(email || '')
    .trim()
    .split('@')[0]
    ?.replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!localPart) return ''

  return localPart
    .split(' ')
    .filter(Boolean)
    .map(toTitleWord)
    .join(' ')
}

export function getUserDisplayName(source: UserDisplaySource) {
  const directName = String(source.name || '').trim()
  if (directName) return directName

  const fullName = [source.firstName, source.lastName]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' ')

  if (fullName) return fullName

  return formatEmailSeed(source.email) || 'Guest'
}

export function getUserInitials(source: UserDisplaySource) {
  const nameParts = getUserDisplayName(source)
    .split(/\s+/)
    .filter(Boolean)

  if (nameParts.length >= 2) {
    return `${nameParts[0][0] || ''}${nameParts[1][0] || ''}`.toUpperCase()
  }

  if (nameParts.length === 1) {
    return (nameParts[0][0] || 'A').toUpperCase()
  }

  return 'G'
}
