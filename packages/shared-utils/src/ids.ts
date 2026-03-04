import { randomBytes } from 'node:crypto';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function secureRandomString(size: number): string {
  const bytes = randomBytes(size);
  let result = '';
  for (let i = 0; i < size; i++) {
    result += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return result;
}

/** Generate a prefixed ID (e.g., "usr_abc123", "ten_xyz789") */
export function generateId(prefix: string, size = 21): string {
  return `${prefix}_${secureRandomString(size)}`;
}

/** Generate a short readable ID for display purposes */
export function generateShortId(size = 8): string {
  return secureRandomString(size);
}

/** Generate a secure API key */
export function generateApiKey(): string {
  return `ak_${secureRandomString(40)}`;
}

/** Get the first N characters of a key for display as a prefix */
export function getKeyPrefix(key: string, length = 8): string {
  return key.substring(0, length);
}
