import type { Config } from "@netlify/functions";
import { withErrors } from "../lib/handler";
import { json, readJson, HttpError, methodNotAllowed } from "../lib/http";
import { requireAdmin, hashPassword } from "../lib/auth";
import { createUserSchema, updateUserSchema } from "../lib/validation";
import { listUsers, createUser, updateUser, getUserRowByEmail, countAdmins } from "../lib/repos";
import { audit } from "../lib/audit";
import { sql } from "../lib/db";

export default withErrors(async (req, context) => {
  const admin = await requireAdmin(req);
  const idParam = context.params?.id;

  if (!idParam) {
    if (req.method === "GET") {
      return json({ users: await listUsers() });
    }
    if (req.method === "POST") {
      const input = await readJson(req, createUserSchema);
      if (await getUserRowByEmail(input.email)) throw new HttpError(409, "A user with that email already exists");
      const user = await createUser({
        email: input.email,
        passwordHash: await hashPassword(input.password),
        displayName: input.displayName,
        role: input.role,
      });
      await audit(admin, "user.create", "user", user.id, { email: user.email, role: user.role });
      return json({ user }, 201);
    }
    return methodNotAllowed(["GET", "POST"]);
  }

  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Invalid user id");

  if (req.method === "PATCH") {
    const input = await readJson(req, updateUserSchema);
    const [target] = await sql<{ id: number; role: string; active: boolean }>`
      SELECT id, role, active FROM users WHERE id = ${id} LIMIT 1`;
    if (!target) throw new HttpError(404, "User not found");

    // Guard: never leave the system with zero active admins, and don't let an
    // admin lock themselves out.
    const demoting = (input.role && input.role !== "admin") || input.active === false;
    if (demoting && target.role === "admin" && (await countAdmins()) <= 1) {
      throw new HttpError(409, "Cannot remove the last active admin");
    }

    const user = await updateUser(id, {
      displayName: input.displayName,
      role: input.role,
      active: input.active,
      passwordHash: input.newPassword ? await hashPassword(input.newPassword) : undefined,
    });
    if (!user) throw new HttpError(404, "User not found");
    await audit(admin, "user.update", "user", id, {
      fields: Object.keys(input).filter((k) => k !== "newPassword"),
      passwordReset: !!input.newPassword,
    });
    return json({ user });
  }

  return methodNotAllowed(["PATCH"]);
});

export const config: Config = {
  path: ["/api/users", "/api/users/:id"],
};
