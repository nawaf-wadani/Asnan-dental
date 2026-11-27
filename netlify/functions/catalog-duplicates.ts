import type { Config } from "@netlify/functions";
import { withErrors } from "../lib/handler";
import { json, readJson, methodNotAllowed } from "../lib/http";
import { requireAdmin } from "../lib/auth";
import { catalogMergeSchema } from "../lib/validation";
import { listDuplicateGroups, mergeCatalogItems } from "../lib/repos";
import { audit } from "../lib/audit";

/**
 * GET  /api/catalog-duplicates   (admin) Groups of items that look like the same product.
 * POST /api/catalog-duplicates   (admin) { keep, remove[] } Fold the duplicates into one item.
 *   The kept item's stock count is not changed.
 */
export default withErrors(async (req) => {
  if (req.method === "GET") {
    await requireAdmin(req);
    return json({ groups: await listDuplicateGroups() });
  }

  if (req.method === "POST") {
    const admin = await requireAdmin(req);
    const { keep, remove } = await readJson(req, catalogMergeSchema);
    const result = await mergeCatalogItems(keep, remove);
    await audit(admin, "catalog.merge", "catalog_item", keep, { removedSkus: remove, ...result });
    return json({ ok: true, ...result });
  }

  return methodNotAllowed(["GET", "POST"]);
});

export const config: Config = {
  path: "/api/catalog-duplicates",
};
