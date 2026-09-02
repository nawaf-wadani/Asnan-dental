import type { Config } from "@netlify/functions";
import { withErrors } from "../lib/handler";
import { json, readJson, HttpError, methodNotAllowed } from "../lib/http";
import { loginSchema } from "../lib/validation";
import {
  clearSessionCookie,
  createSessionCookie,
  ensureBootstrapAdmin,
  getSessionUser,
} from "../lib/auth";
import { getUserRowByEmail } from "../lib/repos";
import { verifyPassword } from "../lib/auth";
import { audit } from "../lib/audit";
import { rateLimit, clientIp } from "../lib/ratelimit";
import { seedCatalogIfEmpty } from "../lib/db";

export default withErrors(async (req) => {
  const path = new URL(req.url).pathname;

  if (path.endsWith("/me")) {
    if (req.method !== "GET") return methodNotAllowed(["GET"]);
    const user = await getSessionUser(req);
    return json({ user });
  }

  if (path.endsWith("/logout")) {
    if (req.method !== "POST") return methodNotAllowed(["POST"]);
    return json({ ok: true }, 200, { "set-cookie": clearSessionCookie() });
  }

  // /login
  if (req.method !== "POST") return methodNotAllowed(["POST"]);

  const ip = clientIp(req);
  const limited = rateLimit(`login:${ip}`, 10, 5 * 60 * 1000);
  if (!limited.ok) {
    throw new HttpError(429, "Too many attempts. Try again later.", { retryAfter: limited.retryAfter });
  }

  const { email, password } = await readJson(req, loginSchema);

  await ensureBootstrapAdmin(email, password);
  // Seeding the catalogue is cheap and idempotent; do it opportunistically on
  // the first authenticated action so a brand-new deploy is immediately usable.
  seedCatalogIfEmpty().catch((e) => console.error("catalog seed failed:", e));

  const row = await getUserRowByEmail(email);
  if (!row || !row.active || !(await verifyPassword(password, row.password_hash))) {
    await audit(null, "login.failed", "user", null, { email });
    throw new HttpError(401, "Incorrect email or password");
  }

  const cookie = await createSessionCookie({
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    tokenVersion: row.token_version,
  });
  await audit({ id: row.id, email: row.email, displayName: row.display_name, role: row.role }, "login.ok", "user", row.id);

  return json(
    { user: { id: row.id, email: row.email, displayName: row.display_name, role: row.role } },
    200,
    { "set-cookie": cookie },
  );
});

export const config: Config = {
  path: ["/api/auth/login", "/api/auth/logout", "/api/auth/me"],
};
