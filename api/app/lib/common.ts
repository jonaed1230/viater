import { promisify } from 'util';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

const { APP_SECRET } = process.env;

export async function createHash() {
  const randomBytesPromise = promisify(randomBytes);
  const hash = (await randomBytesPromise(6)).toString('hex');
  return hash;
}

export function wrapUId(id: string) {
  return jwt.sign({ id }, APP_SECRET!);
}

export function unwrapUId(token: string): any {
  return jwt.verify(token, APP_SECRET!);
}