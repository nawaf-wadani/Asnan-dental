import { getDatabase } from "@netlify/database";
import { CATALOG_SEED } from "../../shared/catalog";

type Db = ReturnType<typeof getDatabase>;

let _db: Db | null = null;

/** Lazily-created singleton Netlify DB driver (auto-points at the correct
 *  branch for the current deploy context). */
export function getDb(): Db {
  if (!_db) _db = getDatabase();
  return _db;
}

/** Tagged-template query. Values are parameterised by the driver. */
export function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  return getDb().sql(strings, ...values) as unknown as Promise<T[]>;
}

/** Raw parameterised query for dynamic SQL (e.g. built-up UPDATE column lists).
 *  Prefer the `sql` tagged template for everything static. */
export function queryRaw<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  return getDb().sql.unsafe(text, params) as unknown as Promise<T[]>;
}

/** Run `fn` inside a single transaction using a pooled connection. */
export async function withTransaction<T>(
  fn: (q: (text: string, params?: unknown[]) => Promise<{ rows: any[] }>) => Promise<T>,
): Promise<T> {
  const client = await getDb().pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn((text, params) => client.query(text, params));
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      /* ignore rollback failure */
    }
    throw err;
  } finally {
    client.release();
  }
}

let _seeded = false;

/** Idempotently loads the starter catalogue into an empty `catalog_items`
 *  table. Cheap no-op on every call after the first. */
export async function seedCatalogIfEmpty(): Promise<void> {
  if (_seeded) return;
  const [{ count }] = await sql<{ count: string }>`SELECT count(*)::int AS count FROM catalog_items`;
  if (Number(count) > 0) {
    _seeded = true;
    return;
  }

  await withTransaction(async (q) => {
    let i = 1;
    const rows: string[] = [];
    const params: unknown[] = [];
    for (const item of CATALOG_SEED) {
      rows.push(
        `($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`,
      );
      params.push(
        item.sku,
        item.name,
        item.category,
        item.categoryLabel,
        item.pkg,
        item.manufacturer,
        item.supplier,
        rows.length, // sort
      );
    }
    await q(
      `INSERT INTO catalog_items
         (sku, name, category, category_label, pkg, manufacturer, supplier, sort)
       VALUES ${rows.join(",")}
       ON CONFLICT (sku) DO NOTHING`,
      params,
    );
  });
  _seeded = true;
}
