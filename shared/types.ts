/** Data shapes shared across the API boundary. Keep in sync with the zod
 *  schemas in `netlify/lib/validation.ts` (those are the runtime enforcement;
 *  these are the compile-time view). */

export type Role = "admin" | "assistant";

export interface User {
  id: number;
  email: string;
  displayName: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface SessionUser {
  id: number;
  email: string;
  displayName: string;
  role: Role;
}

export interface CatalogItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  categoryLabel: string;
  pkg: string | null;
  manufacturer: string | null;
  supplier: string | null;
  itemNumber: string | null;
  photoUrl: string | null;
  onHand: number;
  reorderThreshold: number;
  active: boolean;
  updatedAt: string;
}

export interface OrderSpecialRequest {
  text: string;
  photoUrl: string | null;
}

export interface OrderLine {
  sku: string;
  name: string;
  qty: number;
  unit: string | null;
  manufacturer: string | null;
  supplier: string | null;
  category: string | null;
}

export interface Order {
  id: number;
  createdAt: string;
  createdByEmail: string;
  assistantName: string;
  orderDate: string;
  urgency: "Routine" | "Priority" | "Urgent";
  notes: string;
  itemCount: number;
  lines: OrderLine[];
  specialRequests: OrderSpecialRequest[];
  emailSent: boolean;
}

export interface OrderSummary {
  id: number;
  createdAt: string;
  createdByEmail: string;
  assistantName: string;
  orderDate: string;
  urgency: string;
  itemCount: number;
  emailSent: boolean;
}

export interface PlaceOrderResult {
  order: OrderSummary;
  pdfBase64: string;
  pdfFilename: string;
  emailSent: boolean;
  emailError: string | null;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
