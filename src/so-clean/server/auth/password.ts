import { compare, hash } from "bcryptjs";

/** Cost sesuai kontrak v0.7: bcryptjs cost 12. */
export const PASSWORD_HASH_COST = 12;

export function hashPassword(password: string): Promise<string> {
  return hash(password, PASSWORD_HASH_COST);
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}
