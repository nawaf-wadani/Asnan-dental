import type { Config } from "@netlify/functions";
import { withErrors } from "../lib/handler";
import { json, readJson, HttpError, methodNotAllowed } from "../lib/http";
import { requireAuth, requireAdmin } from "../lib/auth";
import { catalogCreateSchema, catalogUpdateSchema } from "../lib/validation";
import {
  listCatalog,
  getCatalogBySku,
  createCatalogItem,
  updateCatalogItem,
  setCatalogActive,
  deleteCatalogItem,
  findDuplicateItem,
  type DuplicateHit,
} from "../lib/repos";
import { audit } from "../lib/audit";
import { CATALOG_CATEGORIES } from "../../shared/catalog";

function duplicateMessage(d: DuplicateHit): string {
  const where = `"${d.name}" (SKU ${d.sku}${d.active ? "" : ", archived"})`;
  return d.reason === "sku"
    ? `That SKU is already used by ${where}. Edit that item instead of adding it again.`
    : d.reason === "name"
      ? `${where} is already in your catalog with this name. Edit that item instead of adding it again.`
      : `${where} already has this item number. Edit that item instead of adding it again.`;
}

export default withErrors(async (req, context) => {
  const sku = context.params?.sku;

  if (!sku) {
    if (req.method === "GET") {
      const user = await requireAuth(req);
      const includeInactive = user.role === "admin" && new URL(req.url).searchParams.get("all") === "1";
      const items = await listCatalog(includeInactive);
      return json({ items, categories: CATALOG_CATEGORIES });
    }
    if (req.method === "POST") {
      const admin = await requireAdmin(req);
      const input = await readJson(req, catalogCreateSchema);
      const dup = await findDuplicateItem(input);
      if (dup) throw new HttpError(409, duplicateMessage(dup));
      const item = await createCatalogItem(input);
      await audit(admin, "catalog.create", "catalog_item", item.sku, { name: item.name });
      return json({ item }, 201);
    }
    return methodNotAllowed(["GET", "POST"]);
  }

  if (req.method === "PATCH") {
    const admin = await requireAdmin(req);
    const patch = await readJson(req, catalogUpdateSchema);
    const current = await getCatalogBySku(sku);
    if (!current) throw new HttpError(404, "Item not found");
    // Only look for a twin when the SKU, name or item number is actually being changed, so
    // an item that already has a twin can still be edited (and then merged).
    const changed = {
      sku: patch.sku != null && patch.sku !== current.sku ? patch.sku : null,
      name: patch.name != null && patch.name !== current.name ? patch.name : null,
      itemNumber: patch.itemNumber && patch.itemNumber !== current.itemNumber ? patch.itemNumber : null,
    };
    const dup = await findDuplicateItem(changed, sku);
    if (dup) throw new HttpError(409, duplicateMessage(dup));
    const item = await updateCatalogItem(sku, patch);
    if (!item) throw new HttpError(404, "Item not found");
    await audit(admin, "catalog.update", "catalog_item", sku, patch as Record<string, unknown>);
    return json({ item });
  }

  if (req.method === "DELETE") {
    const admin = await requireAdmin(req);
    if (!(await getCatalogBySku(sku))) throw new HttpError(404, "Item not found");
    const hard = new URL(req.url).searchParams.get("hard") === "1";
    if (hard) {
      await deleteCatalogItem(sku);
      await audit(admin, "catalog.delete", "catalog_item", sku);
    } else {
      await setCatalogActive(sku, false);
      await audit(admin, "catalog.archive", "catalog_item", sku);
    }
    return json({ ok: true, hard });
  }

  return methodNotAllowed(["PATCH", "DELETE"]);
});

export const config: Config = {
  path: ["/api/catalog", "/api/catalog/:sku"],
};
