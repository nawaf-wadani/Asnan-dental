import type { Config } from "@netlify/functions";
import { withErrors } from "../lib/handler";
import { json, methodNotAllowed } from "../lib/http";
import { requireAuth, requireAdmin } from "../lib/auth";
import { dashboardStats, frequentSkus, listCatalog, listAudit } from "../lib/repos";

export default withErrors(async (req) => {
  const path = new URL(req.url).pathname;
  if (req.method !== "GET") return methodNotAllowed(["GET"]);

  if (path.endsWith("/frequent")) {
    await requireAuth(req);
    const limit = Math.min(30, Math.max(1, Number(new URL(req.url).searchParams.get("limit")) || 12));
    const [freq, catalog] = await Promise.all([frequentSkus(limit), listCatalog(false)]);
    const bySku = new Map(catalog.map((c) => [c.sku, c]));
    return json({
      items: freq
        .map((f) => {
          const c = bySku.get(f.sku);
          return c ? { sku: f.sku, name: c.name, categoryLabel: c.categoryLabel, manufacturer: c.manufacturer, count: f.count } : null;
        })
        .filter(Boolean),
    });
  }

  if (path.endsWith("/audit")) {
    await requireAdmin(req);
    const url = new URL(req.url);
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit")) || 100));
    const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
    return json({ entries: await listAudit(limit, offset) });
  }

  // /api/stats
  await requireAuth(req);
  return json(await dashboardStats());
});

export const config: Config = {
  path: ["/api/stats", "/api/frequent", "/api/audit"],
};
