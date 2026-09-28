import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { config } from './config.js';

function key() {
  const value = Buffer.from(config.encryptionKey || '', 'base64');
  if (value.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 random bytes encoded as base64');
  return value;
}

export function encrypt(value) {
  if (value == null) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map(part => part.toString('base64url')).join('.');
}

export function decrypt(value) {
  if (value == null) return null;
  const [iv, tag, data] = value.split('.').map(part => Buffer.from(part, 'base64url'));
  const decipher = createDecipheriv('aes-256-gcm', key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}
