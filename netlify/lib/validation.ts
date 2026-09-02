import { z } from "zod";
import { URGENCIES } from "../../shared/rct";

const email = z.string().trim().toLowerCase().email().max(254);
const password = z.string().min(8, "Password must be at least 8 characters").max(200);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

// data: URL or https URL for a compressed product photo (~<= 800 KB)
const photo = z.string().max(800_000).nullable().optional();

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(200),
});

export const createUserSchema = z.object({
  email,
  password,
  displayName: z.string().trim().min(1).max(120),
  role: z.enum(["admin", "assistant"]),
});

export const updateUserSchema = z
  .object({
    displayName: z.string().trim().min(1).max(120).optional(),
    role: z.enum(["admin", "assistant"]).optional(),
    active: z.boolean().optional(),
    newPassword: password.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "No fields to update" });

export const catalogCreateSchema = z.object({
  sku: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(240),
  category: z.string().trim().min(1).max(64),
  categoryLabel: z.string().trim().min(1).max(120),
  pkg: z.string().trim().max(120).nullable().optional(),
  manufacturer: z.string().trim().max(120).nullable().optional(),
  supplier: z.string().trim().max(120).nullable().optional(),
  itemNumber: z.string().trim().max(120).nullable().optional(),
  photoUrl: photo,
  onHand: z.number().int().min(0).max(100000).optional(),
  reorderThreshold: z.number().int().min(0).max(100000).optional(),
});

export const catalogUpdateSchema = catalogCreateSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: "No fields to update" },
);

export const inventoryAdjustSchema = z
  .object({
    sku: z.string().trim().min(1).max(64),
    onHand: z.number().int().min(0).max(100000).optional(),
    reorderThreshold: z.number().int().min(0).max(100000).optional(),
    delta: z.number().int().min(-100000).max(100000).optional(),
  })
  .refine((v) => v.onHand != null || v.reorderThreshold != null || v.delta != null, {
    message: "Provide onHand, reorderThreshold, or delta",
  });

export const placeOrderSchema = z.object({
  assistantName: z.string().trim().min(1).max(120),
  orderDate: isoDate,
  urgency: z.enum(URGENCIES),
  notes: z.string().max(4000).optional().default(""),
  lines: z
    .array(
      z.object({
        sku: z.string().trim().min(1).max(64),
        qty: z.number().int().min(1).max(9999),
      }),
    )
    .max(500)
    .default([]),
  specialRequests: z
    .array(
      z.object({
        text: z.string().trim().min(1).max(2000),
        photoUrl: photo,
      }),
    )
    .max(50)
    .default([]),
}).refine((v) => v.lines.length > 0 || v.specialRequests.length > 0, {
  message: "An order needs at least one item or special request",
});

const rctRow = z.object({
  type: z.string().trim().min(1).max(80),
  taper: z.string().trim().min(1).max(80),
  length: z.string().trim().min(1).max(40),
  qty: z.number().int().min(1).max(99),
});

export const endoOrderSchema = z.object({
  dentist: z.string().trim().min(1).max(120),
  orderDate: isoDate,
  urgency: z.enum(URGENCIES),
  files: z.array(rctRow).min(1).max(50),
  accessories: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  notes: z.string().max(4000).optional().default(""),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CatalogCreateInput = z.infer<typeof catalogCreateSchema>;
export type CatalogUpdateInput = z.infer<typeof catalogUpdateSchema>;
export type InventoryAdjustInput = z.infer<typeof inventoryAdjustSchema>;
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type EndoOrderInput = z.infer<typeof endoOrderSchema>;
