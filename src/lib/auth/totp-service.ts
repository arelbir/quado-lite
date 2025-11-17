/**
 * TOTP SERVICE (Time-Based One-Time Password)
 * 2FA Authentication using TOTP (RFC 6238)
 */

import * as crypto from 'crypto';

const TOTP_WINDOW = 1; // Allow 1 step before/after current time
const TOTP_STEP = 30; // 30 seconds per code
const TOTP_DIGITS = 6; // 6 digit codes

/**
 * Generate a random secret for TOTP
 */
export function generateSecret(): string {
  // Generate 20 bytes (160 bits) random secret
  const buffer = crypto.randomBytes(20);
  return base32Encode(buffer);
}

/**
 * Generate TOTP URI for QR code
 */
export function generateTotpUri(secret: string, accountName: string, issuer: string = 'Quado Lite'): string {
  const encodedAccount = encodeURIComponent(accountName);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&digits=${TOTP_DIGITS}&period=${TOTP_STEP}`;
}

/**
 * Generate current TOTP code
 */
export function generateToken(secret: string, time?: number): string {
  const epoch = Math.floor((time || Date.now()) / 1000);
  const timeCounter = Math.floor(epoch / TOTP_STEP);
  return generateHOTP(secret, timeCounter);
}

/**
 * Verify TOTP code
 */
export function verifyToken(secret: string, token: string, time?: number): boolean {
  const epoch = Math.floor((time || Date.now()) / 1000);
  const timeCounter = Math.floor(epoch / TOTP_STEP);

  // Check current time and window before/after
  for (let i = -TOTP_WINDOW; i <= TOTP_WINDOW; i++) {
    const calculatedToken = generateHOTP(secret, timeCounter + i);
    if (calculatedToken === token) {
      return true;
    }
  }

  return false;
}

/**
 * Generate backup codes
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

/**
 * Hash backup code for storage
 */
export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/**
 * Verify backup code
 */
export function verifyBackupCode(code: string, hashedCode: string): boolean {
  const hash = hashBackupCode(code);
  return hash === hashedCode;
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Generate HOTP (HMAC-based One-Time Password)
 */
function generateHOTP(secret: string, counter: number): string {
  const decodedSecret = base32Decode(secret);
  const buffer = Buffer.alloc(8);
  
  // Write counter as big-endian
  buffer.writeBigInt64BE(BigInt(counter));
  
  // Generate HMAC
  const hmac = crypto.createHmac('sha1', Buffer.from(decodedSecret) as any);
  hmac.update(buffer as any);
  const hash = hmac.digest();
  
  // Dynamic truncation
  const offset = (hash[hash.length - 1] || 0) & 0xf;
  const binary =
    (((hash[offset] || 0) & 0x7f) << 24) |
    (((hash[offset + 1] || 0) & 0xff) << 16) |
    (((hash[offset + 2] || 0) & 0xff) << 8) |
    ((hash[offset + 3] || 0) & 0xff);
  
  const otp = binary % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, '0');
}

/**
 * Base32 encoding
 */
function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Base32 decoding
 */
function base32Decode(encoded: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanEncoded = encoded.toUpperCase().replace(/=+$/, '');
  
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = new Uint8Array(Math.ceil((cleanEncoded.length * 5) / 8));

  for (let i = 0; i < cleanEncoded.length; i++) {
    const char = cleanEncoded[i];
    if (!char) continue;
    
    const idx = alphabet.indexOf(char);
    if (idx === -1) throw new Error('Invalid base32 character');

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }

  return output;
}
