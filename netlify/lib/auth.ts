import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";
import { sql } from "./db";
import { HttpError, parseCookies, serializeCookie } from "./http";
import type { Role, SessionUser } from "../../shared/types";

const scrypt = promisify(scryptCb) as (pw: string | Buffer, salt: Buffer, keylen: number) => Promise<Buffer>;

export const SESSION_COOKIE = "asnan_session";
const SCRYPT_KEYLEN = 64;

// ---- Password hashing ----------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = await scrypt(password, salt, expected.length);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

// ---- Session tokens ----------------------------------------------------

function secretKey(): Uint8Array {
  return new TextEncoder().encode(env.authSecret);
}

interface TokenClaims {
  sub: string;
  email: string;
  name: string;
  role: Role;
  tv: number;
}

export async function createSessionCookie(user: {
  id: number;
  email: string;
  displayName: string;
  role: Role;
  tokenVersion: number;
}): Promise<string> {
  const maxAgeSec = env.sessionHours * 3600;
  const token = await new SignJWT({
    email: user.email,
    name: user.displayName,
    role: user.role,
    tv: user.tokenVersion,
  } satisfies Omit<TokenClaims, "sub">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${env.sessionHours}h`)
    .sign(secretKey());

  return serializeCookie(SESSION_COOKIE, token, {
    maxAge: maxAgeSec,
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  });
}

export function clearSessionCookie(): string {
  return serializeCookie(SESSION_COOKIE, "", { maxAge: 0, httpOnly: true, secure: true, sameSite: "Lax" });
}

interface UserRow {
  id: number;
  email: string;
  display_name: string;
  role: Role;
  active: boolean;
  token_version: number;
}

/** Returns the authenticated user or null. Verifies the JWT signature/expiry
 *  AND that the token version still matches the DB (so deactivating a user or
 *  resetting their password immediately invalidates existing sessions). */
export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;

  let claims: TokenClaims;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    claims = payload as unknown as TokenClaims;
  } catch {
    return null;
  }

  const id = Number(claims.sub);
  if (!Number.isInteger(id)) return null;

  const [row] = await sql<UserRow>`
    SELECT id, email, display_name, role, active, token_version
    FROM users WHERE id = ${id} LIMIT 1`;
  if (!row || !row.active || row.token_version !== claims.tv) return null;

  return { id: row.id, email: row.email, displayName: row.display_name, role: row.role };
}

export async function requireAuth(req: Request): Promise<SessionUser> {
  const user = await getSessionUser(req);
  if (!user) throw new HttpError(401, "Not authenticated");
  return user;
}

export async function requireAdmin(req: Request): Promise<SessionUser> {
  const user = await requireAuth(req);
  if (user.role !== "admin") throw new HttpError(403, "Admin access required");
  return user;
}

// ---- Bootstrap admin ----------------------------------------------------

/** On the very first login, if no users exist yet and the supplied credentials
 *  match the ADMIN_EMAIL / ADMIN_PASSWORD env vars, create the admin account. */
export async function ensureBootstrapAdmin(email: string, password: string): Promise<void> {
  const [{ count }] = await sql<{ count: string }>`SELECT count(*)::int AS count FROM users`;
  if (Number(count) > 0) return;

  const adminEmail = env.adminEmail;
  const adminPassword = env.adminPassword;
  if (!adminPassword) return;
  if (email.trim().toLowerCase() !== adminEmail) return;
  if (password !== adminPassword) return;

  const hash = await hashPassword(adminPassword);
  await sql`
    INSERT INTO users (email, password_hash, role, display_name, active)
    VALUES (${adminEmail}, ${hash}, 'admin', ${"Nawaf Alwadani"}, true)
    ON CONFLICT (email) DO NOTHING`;
}
