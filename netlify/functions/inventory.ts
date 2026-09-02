import type { Config } from "@netlify/functions";
import { withErrors } from "../lib/handler";
import { json, readJson, HttpError, methodNotAllowed } from "../lib/http";
import { requireAuth } from "../lib/auth";
import { inventoryAdjustSchema } from "../lib/validation";
import { listCatalog, getCatalogBySku, adjustInventory } from "../lib/repos";
import { audit } from "../lib/audit";

export default withErrors(async (req) => {
  if (req.method === "GET") {
    await requireAuth(req);
    const items = await listCatalog(false);
    return json({
      items: items.map((i) => ({
        sku: i.sku,
        name: i.name,
        category: i.category,
        categoryLabel: i.categoryLabel,
        manufacturer: i.manufacturer,
        supplier: i.supplier,
        itemNumber: i.itemNumber,
        photoUrl: i.photoUrl,
        onHand: i.onHand,
        reorderThreshold: i.reorderThreshold,
      })),
    });
  }

  if (req.method === "PATCH") {
    const user = await requireAuth(req);
    const input = await readJson(req, inventoryAdjustSchema);
    const before = await getCatalogBySku(input.sku);
    if (!before) throw new HttpError(404, "Item not found");
    // Only admins may change the reorder threshold; assistants may adjust counts.
    if (input.reorderThreshold != null && user.role !== "admin") {
      throw new HttpError(403, "Only an admin can change the reorder threshold");
    }
    const item = await adjustInventory(input.sku, input);
    await audit(user, "inventory.adjust", "catalog_item", input.sku, {
      from: before.onHand,
      to: item?.onHand,
      delta: input.delta ?? null,
      reorderThreshold: input.reorderThreshold ?? null,
    });
    return json({ item });
  }

  return methodNotAllowed(["GET", "PATCH"]);
});

export const config: Config = {
  path: "/api/inventory",
};
