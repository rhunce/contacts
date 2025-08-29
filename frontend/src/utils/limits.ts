// Get limits from environment variables with fallbacks
export const LIMITS = {
  MAX_USERS: parseInt(process.env.NEXT_PUBLIC_MAX_USERS || '50'),
  MAX_CONTACTS_PER_USER: parseInt(process.env.NEXT_PUBLIC_MAX_CONTACTS_PER_USER || '50')
};

// Validate limits are reasonable
if (LIMITS.MAX_USERS < 1 || LIMITS.MAX_USERS > 10000) {
  console.warn('MAX_USERS limit seems unreasonable:', LIMITS.MAX_USERS);
}

if (LIMITS.MAX_CONTACTS_PER_USER < 1 || LIMITS.MAX_CONTACTS_PER_USER > 1000) {
  console.warn('MAX_CONTACTS_PER_USER limit seems unreasonable:', LIMITS.MAX_CONTACTS_PER_USER);
}

export function getMaxUsers(): number {
  return LIMITS.MAX_USERS;
}

export function getMaxContactsPerUser(): number {
  return LIMITS.MAX_CONTACTS_PER_USER;
}
