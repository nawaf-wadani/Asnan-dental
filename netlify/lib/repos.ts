import { sql, queryRaw, withTransaction } from "./db";
import type {
  CatalogItem,
  Order,
  OrderSummary,
  Role,
  User,
} from "../../shared/types";
import type {
  CatalogCreateInput,
  CatalogUpdateInput,
  EndoOrderInput,
  PlaceOrderInput,
} from "./validation";

// ---------------------------------------------------------------- catalog ---

interface CatalogRow {
  id: number;
  sku: string;
  name: string;
  category: string;
  category_label: string;
  pkg: string | null;
  manufacturer: string | null;
  supplier: string | null;
  item_number: string | null;
  photo_url: string | null;
  on_hand: number;
  reorder_threshold: number;
  active: boolean;
  updated_at: string;
}

function toCatalogItem(r: CatalogRow): CatalogItem {
  return {
    id: r.id,
    sku: r.sku,
    name: r.name,
    category: r.category,
    categoryLabel: r.category_label,
    pkg: r.pkg,
    manufacturer: r.manufacturer,
    supplier: r.supplier,
    itemNumber: r.item_number,
    photoUrl: r.photo_url,
    onHand: r.on_hand,
    reorderThreshold: r.reorder_threshold,
    active: r.active,
    updatedAt: typeof r.updated_at === "string" ? r.updated_at : new Date(r.updated_at).toISOString(),
  };
}

export async function listCatalog(includeInactive = false): Promise<CatalogItem[]> {
  const rows = includeInactive
    ? await sql<CatalogRow>`SELECT * FROM catalog_items ORDER BY sort, name`
    : await sql<CatalogRow>`SELECT * FROM catalog_items WHERE active = TRUE ORDER BY sort, name`;
  return rows.map(toCatalogItem);
}

export async function getCatalogBySku(sku: string): Promise<CatalogItem | null> {
  const [row] = await sql<CatalogRow>`SELECT * FROM catalog_items WHERE sku = ${sku} LIMIT 1`;
  return row ? toCatalogItem(row) : null;
}

export async function createCatalogItem(input: CatalogCreateInput): Promise<CatalogItem> {
  const [row] = await sql<CatalogRow>`
    INSERT INTO catalog_items
      (sku, name, category, category_label, pkg, manufacturer, supplier, item_number, photo_url, on_hand, reorder_threshold)
    VALUES (
      ${input.sku}, ${input.name}, ${input.category}, ${input.categoryLabel},
      ${input.pkg ?? null}, ${input.manufacturer ?? null}, ${input.supplier ?? null},
      ${input.itemNumber ?? null}, ${input.photoUrl ?? null},
      ${input.onHand ?? 0}, ${input.reorderThreshold ?? 1}
    )
    RETURNING *`;
  return toCatalogItem(row);
}

const CATALOG_COLUMN: Record<keyof CatalogUpdateInput, string> = {
  sku: "sku",
  name: "name",
  category: "category",
  categoryLabel: "category_label",
  pkg: "pkg",
  manufacturer: "manufacturer",
  supplier: "supplier",
  itemNumber: "item_number",
  photoUrl: "photo_url",
  onHand: "on_hand",
  reorderThreshold: "reorder_threshold",
  active: "active",
};

export async function updateCatalogItem(sku: string, patch: CatalogUpdateInput): Promise<CatalogItem | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const [key, value] of Object.entries(patch)) {
    const col = CATALOG_COLUMN[key as keyof CatalogUpdateInput];
    if (!col) continue;
    params.push(value ?? null);
    sets.push(`${col} = $${params.length}`);
  }
  if (sets.length === 0) return getCatalogBySku(sku);
  params.push(sku);
  const rows = await queryRaw<CatalogRow>(
    `UPDATE catalog_items SET ${sets.join(", ")}, updated_at = NOW() WHERE sku = $${params.length} RETURNING *`,
    params,
  );
  return rows[0] ? toCatalogItem(rows[0]) : null;
}

export async function setCatalogActive(sku: string, active: boolean): Promise<void> {
  await sql`UPDATE catalog_items SET active = ${active}, updated_at = NOW() WHERE sku = ${sku}`;
}

/** Permanent delete. Order history keeps its own copy of item name/qty, so past
 *  orders are unaffected. */
export async function deleteCatalogItem(sku: string): Promise<boolean> {
  const rows = await sql<{ sku: string }>`DELETE FROM catalog_items WHERE sku = ${sku} RETURNING sku`;
  return rows.length > 0;
}

export async function adjustInventory(
  sku: string,
  change: { onHand?: number; reorderThreshold?: number; delta?: number },
): Promise<CatalogItem | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (change.onHand != null) {
    params.push(change.onHand);
    sets.push(`on_hand = $${params.length}`);
  }
  if (change.delta != null) {
    params.push(change.delta);
    sets.push(`on_hand = GREATEST(0, on_hand + $${params.length})`);
  }
  if (change.reorderThreshold != null) {
    params.push(change.reorderThreshold);
    sets.push(`reorder_threshold = $${params.length}`);
  }
  if (sets.length === 0) return getCatalogBySku(sku);
  params.push(sku);
  const rows = await queryRaw<CatalogRow>(
    `UPDATE catalog_items SET ${sets.join(", ")}, updated_at = NOW() WHERE sku = $${params.length} RETURNING *`,
    params,
  );
  return rows[0] ? toCatalogItem(rows[0]) : null;
}

// ------------------------------------------------------------------ users ---

interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  role: Role;
  display_name: string;
  active: boolean;
  token_version: number;
  created_at: string;
}

function toUser(r: UserRow): User {
  return {
    id: r.id,
    email: r.email,
    displayName: r.display_name,
    role: r.role,
    active: r.active,
    createdAt: typeof r.created_at === "string" ? r.created_at : new Date(r.created_at).toISOString(),
  };
}

export async function listUsers(): Promise<User[]> {
  const rows = await sql<UserRow>`SELECT * FROM users ORDER BY role, display_name`;
  return rows.map(toUser);
}

export async function getUserRowByEmail(email: string): Promise<UserRow | null> {
  const [row] = await sql<UserRow>`SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`;
  return row ?? null;
}

export async function createUser(args: {
  email: string;
  passwordHash: string;
  displayName: string;
  role: Role;
}): Promise<User> {
  const [row] = await sql<UserRow>`
    INSERT INTO users (email, password_hash, display_name, role, active)
    VALUES (${args.email.toLowerCase()}, ${args.passwordHash}, ${args.displayName}, ${args.role}, TRUE)
    RETURNING *`;
  return toUser(row);
}

export async function updateUser(
  id: number,
  patch: { displayName?: string; role?: Role; active?: boolean; passwordHash?: string },
): Promise<User | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (patch.displayName != null) {
    params.push(patch.displayName);
    sets.push(`display_name = $${params.length}`);
  }
  if (patch.role != null) {
    params.push(patch.role);
    sets.push(`role = $${params.length}`);
  }
  if (patch.active != null) {
    params.push(patch.active);
    sets.push(`active = $${params.length}`);
  }
  if (patch.passwordHash != null) {
    params.push(patch.passwordHash);
    sets.push(`password_hash = $${params.length}`);
  }
  // Any password reset or deactivation invalidates existing sessions.
  if (patch.passwordHash != null || patch.active === false) {
    sets.push(`token_version = token_version + 1`);
  }
  if (sets.length === 0) return null;
  params.push(id);
  const rows = await queryRaw<UserRow>(
    `UPDATE users SET ${sets.join(", ")}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
    params,
  );
  return rows[0] ? toUser(rows[0]) : null;
}

export async function countAdmins(): Promise<number> {
  const [{ count }] = await sql<{ count: string }>`SELECT count(*)::int AS count FROM users WHERE role = 'admin' AND active = TRUE`;
  return Number(count);
}

// ----------------------------------------------------------------- orders ---

export async function placeSupplyOrder(
  user: { id: number; email: string },
  input: PlaceOrderInput,
): Promise<number> {
  return withTransaction(async (q) => {
    const itemCount =
      input.lines.reduce((s, l) => s + l.qty, 0) + input.specialRequests.length;

    const { rows } = await q(
      `INSERT INTO orders (created_by, created_by_email, assistant_name, order_date, urgency, notes, item_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [user.id, user.email, input.assistantName, input.orderDate, input.urgency, input.notes ?? "", itemCount],
    );
    const orderId = rows[0].id as number;

    if (input.lines.length) {
      // resolve catalogue metadata for each SKU
      const skus = input.lines.map((l) => l.sku);
      const { rows: catRows } = await q(
        `SELECT sku, name, pkg, manufacturer, supplier, category_label FROM catalog_items WHERE sku = ANY($1)`,
        [skus],
      );
      const meta = new Map<string, any>(catRows.map((r: any) => [r.sku, r]));

      const values: string[] = [];
      const params: unknown[] = [];
      let i = 1;
      for (const line of input.lines) {
        const m = meta.get(line.sku);
        values.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
        params.push(
          orderId,
          line.sku,
          m?.name ?? line.sku,
          line.qty,
          m?.pkg ?? null,
          m?.manufacturer ?? null,
          m?.supplier ?? null,
          m?.category_label ?? null,
        );
      }
      await q(
        `INSERT INTO order_items (order_id, sku, name, qty, unit, manufacturer, supplier, category) VALUES ${values.join(",")}`,
        params,
      );
    }

    for (const sr of input.specialRequests) {
      await q(`INSERT INTO order_special_requests (order_id, text, photo_url) VALUES ($1, $2, $3)`, [
        orderId,
        sr.text,
        sr.photoUrl ?? null,
      ]);
    }

    return orderId;
  });
}

export async function markOrderEmailed(orderId: number, sent: boolean): Promise<void> {
  await sql`UPDATE orders SET email_sent = ${sent} WHERE id = ${orderId}`;
}

interface OrderRow {
  id: number;
  created_at: string;
  created_by_email: string;
  assistant_name: string;
  order_date: string;
  urgency: string;
  notes: string;
  item_count: number;
  email_sent: boolean;
}

function iso(v: string): string {
  return typeof v === "string" ? v : new Date(v).toISOString();
}

export async function getOrder(id: number): Promise<Order | null> {
  const [row] = await sql<OrderRow>`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
  if (!row) return null;
  const lines = await sql<{
    sku: string;
    name: string;
    qty: number;
    unit: string | null;
    manufacturer: string | null;
    supplier: string | null;
    category: string | null;
  }>`SELECT sku, name, qty, unit, manufacturer, supplier, category FROM order_items WHERE order_id = ${id} ORDER BY id`;
  const specials = await sql<{ text: string; photo_url: string | null }>`
    SELECT text, photo_url FROM order_special_requests WHERE order_id = ${id} ORDER BY id`;

  return {
    id: row.id,
    createdAt: iso(row.created_at),
    createdByEmail: row.created_by_email,
    assistantName: row.assistant_name,
    orderDate: typeof row.order_date === "string" ? row.order_date : new Date(row.order_date).toISOString().slice(0, 10),
    urgency: row.urgency as Order["urgency"],
    notes: row.notes,
    itemCount: row.item_count,
    emailSent: row.email_sent,
    lines: lines.map((l) => ({
      sku: l.sku,
      name: l.name,
      qty: l.qty,
      unit: l.unit,
      manufacturer: l.manufacturer,
      supplier: l.supplier,
      category: l.category,
    })),
    specialRequests: specials.map((s) => ({ text: s.text, photoUrl: s.photo_url })),
  };
}

export async function listOrders(opts: {
  onlyUserId?: number;
  limit: number;
  offset: number;
}): Promise<OrderSummary[]> {
  const rows = opts.onlyUserId
    ? await sql<OrderRow>`
        SELECT * FROM orders WHERE created_by = ${opts.onlyUserId}
        ORDER BY created_at DESC LIMIT ${opts.limit} OFFSET ${opts.offset}`
    : await sql<OrderRow>`
        SELECT * FROM orders ORDER BY created_at DESC LIMIT ${opts.limit} OFFSET ${opts.offset}`;
  return rows.map((row) => ({
    id: row.id,
    createdAt: iso(row.created_at),
    createdByEmail: row.created_by_email,
    assistantName: row.assistant_name,
    orderDate:
      typeof row.order_date === "string" ? row.order_date : new Date(row.order_date).toISOString().slice(0, 10),
    urgency: row.urgency,
    itemCount: row.item_count,
    emailSent: row.email_sent,
  }));
}

export async function deleteOrder(id: number): Promise<boolean> {
  const rows = await sql<{ id: number }>`DELETE FROM orders WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

// ------------------------------------------------------------- endo orders ---

export async function placeEndoOrder(
  user: { id: number; email: string },
  input: EndoOrderInput,
): Promise<number> {
  const [row] = await sql<{ id: number }>`
    INSERT INTO endo_orders (created_by, created_by_email, dentist, order_date, urgency, payload)
    VALUES (${user.id}, ${user.email}, ${input.dentist}, ${input.orderDate}, ${input.urgency}, ${JSON.stringify(input)}::jsonb)
    RETURNING id`;
  return row.id;
}

export async function markEndoEmailed(id: number, sent: boolean): Promise<void> {
  await sql`UPDATE endo_orders SET email_sent = ${sent} WHERE id = ${id}`;
}

// ------------------------------------------------------------ stats / misc ---

export async function frequentSkus(limit: number): Promise<{ sku: string; count: number }[]> {
  const rows = await sql<{ sku: string; count: string }>`
    SELECT sku, count(*)::int AS count FROM order_items
    GROUP BY sku ORDER BY count DESC LIMIT ${limit}`;
  return rows.map((r) => ({ sku: r.sku, count: Number(r.count) }));
}

export async function dashboardStats(): Promise<{
  totalOrders: number;
  totalUnits: number;
  lowStock: number;
  outOfStock: number;
  catalogSize: number;
}> {
  const [o] = await sql<{ total_orders: string; total_units: string }>`
    SELECT
      (SELECT count(*) FROM orders)::int AS total_orders,
      (SELECT COALESCE(sum(qty), 0) FROM order_items)::int AS total_units`;
  const [c] = await sql<{ low: string; out: string; size: string }>`
    SELECT
      count(*) FILTER (WHERE active AND on_hand > 0 AND on_hand <= reorder_threshold)::int AS low,
      count(*) FILTER (WHERE active AND on_hand = 0)::int AS out,
      count(*) FILTER (WHERE active)::int AS size
    FROM catalog_items`;
  return {
    totalOrders: Number(o.total_orders),
    totalUnits: Number(o.total_units),
    lowStock: Number(c.low),
    outOfStock: Number(c.out),
    catalogSize: Number(c.size),
  };
}

export async function listAudit(limit: number, offset: number) {
  return sql<{
    id: number;
    at: string;
    actor_email: string;
    action: string;
    entity: string;
    entity_id: string | null;
    detail: unknown;
  }>`SELECT id, at, actor_email, action, entity, entity_id, detail
     FROM audit_log ORDER BY at DESC LIMIT ${limit} OFFSET ${offset}`;
}
