/**
 * PIN utility – hash & verify a 4-digit PIN using the Web Crypto API.
 * We use PBKDF2 with a user-id-based salt so the same PIN for different
 * users produces different hashes, and brute-forcing the 10 000 keyspace
 * is still computationally expensive.
 */

const ITERATIONS = 100_000
const KEY_LENGTH = 256 // bits

async function deriveKey(pin, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH
  )
  return Array.from(new Uint8Array(bits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Hash a PIN with the user's ID as salt. Returns a hex string. */
export async function hashPin(pin, userId) {
  return deriveKey(pin, `temple-keepers-pin-${userId}`)
}

/** Verify a PIN against a stored hash. */
export async function verifyPin(pin, userId, storedHash) {
  const hash = await deriveKey(pin, `temple-keepers-pin-${userId}`)
  return hash === storedHash
}
