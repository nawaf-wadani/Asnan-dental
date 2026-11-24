import type { Config } from "@netlify/functions";
import { withErrors } from "../lib/handler";
import { json, readJson, methodNotAllowed } from "../lib/http";
import { requireAdmin } from "../lib/auth";
import { photoLookupSchema } from "../lib/validation";
import { sql } from "../lib/db";
import { audit } from "../lib/audit";

const BASE = "https://www.pattersondental.com";
const IMG_RE = /<img[^>]*itemDetailImageContainer[^>]*src="https:\/\/content\.pattersondental\.com\/LargeSquare\/images\/([^"]+)"/;

/** Finds the product photo for one Patterson item number, or null. */
async function lookup(sku: string): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${BASE}/Supplies/ItemDetail/0${sku}`, {
      headers: { "user-agent": "AsnanDentalInventory/1.0 (clinic supply ordering)", accept: "text/html" },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = IMG_RE.exec(html);
    if (!m) return null;
    // Only accept plain file names so an odd page can't smuggle a different URL in.
    if (!/^[A-Za-z0-9_.-]+$/.test(m[1])) return null;
    return `https://content.pattersondental.com/MediumSquare/images/${m[1]}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * POST /api/photos/lookup  { skus: string[] }   (admin)
 * For each 8-digit Patterson item number, finds its photo on Patterson's public
 * site and saves the photo link on the catalog item (only if it has none yet).
 */
export default withErrors(async (req) => {
  if (req.method !== "POST") return methodNotAllowed(["POST"]);
  const admin = await requireAdmin(req);
  const { skus } = await readJson(req, photoLookupSchema);

  const eligible = [...new Set(skus)].filter((s) => /^\d{8}$/.test(s));
  const skipped = skus.filter((s) => !/^\d{8}$/.test(s));

  const found: Record<string, string> = {};
  const notFound: string[] = [];
  let next = 0;
  async function worker() {
    while (next < eligible.length) {
      const sku = eligible[next++];
      const url = await lookup(sku);
      if (url) found[sku] = url;
      else notFound.push(sku);
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()]);

  for (const [sku, url] of Object.entries(found)) {
    await sql`
      UPDATE catalog_items SET photo_url = ${url}, updated_at = NOW()
      WHERE sku = ${sku} AND (photo_url IS NULL OR photo_url = '')`;
  }
  await audit(admin, "catalog.photos", "catalog_item", null, { found: Object.keys(found).length, notFound: notFound.length });

  return json({ found: Object.keys(found).length, notFound, skipped });
});

export const config: Config = {
  path: "/api/photos/lookup",
};
