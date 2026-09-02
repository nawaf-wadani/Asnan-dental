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
} from "../lib/repos";
import { audit } from "../lib/audit";
import { CATALOG_CATEGORIES } from "../../shared/catalog";

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
      if (await getCatalogBySku(input.sku)) throw new HttpError(409, `SKU ${input.sku} already exists`);
      const item = await createCatalogItem(input);
      await audit(admin, "catalog.create", "catalog_item", item.sku, { name: item.name });
      return json({ item }, 201);
    }
    return methodNotAllowed(["GET", "POST"]);
  }

  if (req.method === "PATCH") {
    const admin = await requireAdmin(req);
    const patch = await readJson(req, catalogUpdateSchema);
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
