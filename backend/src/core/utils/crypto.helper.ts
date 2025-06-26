import { randomBytes, randomUUID } from 'crypto';

/**
 * Generate a secure, url-safe string
 *
 * @param length number of random chars to generate
 * @returns a cryptographically secure url-safe string
 */
export const generateSecureRandomString = (length: number): string => {
  const buff = randomBytes(length);
  return buff.toString('base64').replace(/\//g, '_').replace(/\+/g, '-');
};

/**
 * Generate a secure string
 * 
 * Generates a secure random alphanumeric string of a given length.
 * @param {number} length - Desired length of the output string.
 * @returns {string} - Secure random alphanumeric string.
 */
export const generateSecureRandomAlphanumericString = (length: number): string => {
    const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charsLength = possibleChars.length;
    const buff = randomBytes(length);

    let result = '';
    for (let i = 0; i < length; i++) {
        result += possibleChars[buff[i] % charsLength];
    }

    return result;
}

/**
 * Generate a secure uuid
 *
 * @returns a cryptographically secure uuid
 */
export const generateSecureRandomUUID = () => randomUUID();
