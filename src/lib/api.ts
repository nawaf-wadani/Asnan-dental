import type {
  CatalogItem,
  Order,
  OrderSummary,
  PlaceOrderResult,
  Role,
  SessionUser,
  User,
} from "@shared/types";
import type { CatalogCategory } from "@shared/catalog";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: init.body ? { "content-type": "application/json", ...(init.headers ?? {}) } : init.headers,
    ...init,
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;
  if (!res.ok) {
    throw new ApiError(res.status, body?.error ?? `Request failed (${res.status})`, body?.details);
  }
  return body as T;
}

// ---- auth ----
export const authApi = {
  me: () => request<{ user: SessionUser | null }>("/api/auth/me"),
  login: (email: string, password: string) =>
    request<{ user: SessionUser }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
};

// ---- catalog ----
export const catalogApi = {
  list: (all = false) =>
    request<{ items: CatalogItem[]; categories: CatalogCategory[] }>(`/api/catalog${all ? "?all=1" : ""}`),
  create: (item: Partial<CatalogItem> & { sku: string; name: string; category: string; categoryLabel: string }) =>
    request<{ item: CatalogItem }>("/api/catalog", { method: "POST", body: JSON.stringify(item) }),
  update: (sku: string, patch: Partial<CatalogItem>) =>
    request<{ item: CatalogItem }>(`/api/catalog/${encodeURIComponent(sku)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  retire: (sku: string) =>
    request<{ ok: true }>(`/api/catalog/${encodeURIComponent(sku)}`, { method: "DELETE" }),
};

// ---- inventory ----
export interface InventoryRow {
  sku: string;
  name: string;
  category: string;
  categoryLabel: string;
  manufacturer: string | null;
  supplier: string | null;
  itemNumber: string | null;
  photoUrl: string | null;
  onHand: number;
  reorderThreshold: number;
}
export const inventoryApi = {
  list: () => request<{ items: InventoryRow[] }>("/api/inventory"),
  adjust: (input: { sku: string; onHand?: number; reorderThreshold?: number; delta?: number }) =>
    request<{ item: CatalogItem }>("/api/inventory", { method: "PATCH", body: JSON.stringify(input) }),
};

// ---- orders ----
export interface PlaceOrderPayload {
  assistantName: string;
  orderDate: string;
  urgency: "Routine" | "Priority" | "Urgent";
  notes?: string;
  lines: { sku: string; qty: number }[];
  specialRequests: { text: string; photoUrl: string | null }[];
}
export const ordersApi = {
  list: (limit = 50, offset = 0) =>
    request<{ orders: OrderSummary[] }>(`/api/orders?limit=${limit}&offset=${offset}`),
  get: (id: number) => request<{ order: Order }>(`/api/orders/${id}`),
  place: (payload: PlaceOrderPayload) =>
    request<PlaceOrderResult>("/api/orders", { method: "POST", body: JSON.stringify(payload) }),
  remove: (id: number) => request<{ ok: true }>(`/api/orders/${id}`, { method: "DELETE" }),
  pdfUrl: (id: number) => `/api/orders/${id}/pdf`,
};

// ---- endo orders ----
export interface EndoOrderPayload {
  dentist: string;
  orderDate: string;
  urgency: "Routine" | "Priority" | "Urgent";
  files: { type: string; taper: string; length: string; qty: number }[];
  accessories: string[];
  notes?: string;
}
export const endoApi = {
  place: (payload: EndoOrderPayload) =>
    request<{ id: number; pdfBase64: string; pdfFilename: string; emailSent: boolean; emailError: string | null }>(
      "/api/endo-orders",
      { method: "POST", body: JSON.stringify(payload) },
    ),
};

// ---- users (admin) ----
export const usersApi = {
  list: () => request<{ users: User[] }>("/api/users"),
  create: (input: { email: string; password: string; displayName: string; role: Role }) =>
    request<{ user: User }>("/api/users", { method: "POST", body: JSON.stringify(input) }),
  update: (
    id: number,
    patch: { displayName?: string; role?: Role; active?: boolean; newPassword?: string },
  ) => request<{ user: User }>(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
};

// ---- stats ----
export interface DashboardStats {
  totalOrders: number;
  totalUnits: number;
  lowStock: number;
  outOfStock: number;
  catalogSize: number;
}
export interface FrequentItem {
  sku: string;
  name: string;
  categoryLabel: string;
  manufacturer: string | null;
  count: number;
}
export interface AuditEntry {
  id: number;
  at: string;
  actor_email: string;
  action: string;
  entity: string;
  entity_id: string | null;
  detail: unknown;
}
export const statsApi = {
  dashboard: () => request<DashboardStats>("/api/stats"),
  frequent: (limit = 12) => request<{ items: FrequentItem[] }>(`/api/frequent?limit=${limit}`),
  audit: (limit = 100, offset = 0) => request<{ entries: AuditEntry[] }>(`/api/audit?limit=${limit}&offset=${offset}`),
};
