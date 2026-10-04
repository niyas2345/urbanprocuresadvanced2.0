// Urban Procures Advanced
// Cryptographic Password Hashing & Token Engine
// Compatible with both Cloudflare Workers (WebCrypto) and Node.js (crypto)

import crypto from 'node:crypto';

export class AuthHelper {
  /**
   * Generates a cryptographically random salt (16 bytes hex)
   */
  public static generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Hashes a password using PBKDF2 with SHA-256 and 100,000 iterations
   */
  public static hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
  }

  /**
   * Verifies password against salt and stored hash using constant-time comparison
   */
  public static verifyPassword(password: string, salt: string, storedHash: string): boolean {
    const computedHash = this.hashPassword(password, salt);
    try {
      return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(storedHash, 'hex'));
    } catch {
      return false;
    }
  }

  /**
   * Generates a cryptographically secure session token (32 bytes hex)
   */
  public static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
