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
 * Generate a secure uuid
 *
 * @returns a cryptographically secure uuid
 */
export const generateSecureRandomUUID = () => randomUUID();
