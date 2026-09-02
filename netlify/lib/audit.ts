import { sql } from "./db";
import type { SessionUser } from "../../shared/types";

/** Append-only record of every state-changing action. Never blocks the caller:
 *  an audit write failure is logged but not propagated. */
export async function audit(
  actor: SessionUser | null,
  action: string,
  entity: string,
  entityId: string | number | null,
  detail?: Record<string, unknown>,
): Promise<void> {
  try {
    await sql`
      INSERT INTO audit_log (actor_id, actor_email, action, entity, entity_id, detail)
      VALUES (
        ${actor?.id ?? null},
        ${actor?.email ?? "system"},
        ${action},
        ${entity},
        ${entityId != null ? String(entityId) : null},
        ${JSON.stringify(detail ?? {})}::jsonb
      )`;
  } catch (err) {
    console.error("audit write failed:", err);
  }
}
