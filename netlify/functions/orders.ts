import type { Config } from "@netlify/functions";
import { withErrors } from "../lib/handler";
import { json, readJson, HttpError, methodNotAllowed } from "../lib/http";
import { requireAuth, requireAdmin } from "../lib/auth";
import { placeOrderSchema } from "../lib/validation";
import {
  placeSupplyOrder,
  getOrder,
  listOrders,
  deleteOrder,
  markOrderEmailed,
} from "../lib/repos";
import { audit } from "../lib/audit";
import { buildSupplyOrderPdf } from "../lib/pdf";
import { sendOrderEmail } from "../lib/email";
import { env } from "../lib/env";
import type { Order } from "../../shared/types";

function pdfFilename(order: Order): string {
  return `Asnan-Order-${order.id}-${order.orderDate}.pdf`;
}

function plainText(order: Order): string {
  const lines: string[] = [];
  lines.push(`ASNAN DENTAL — INVENTORY SUPPLY ORDER #${order.id}`);
  lines.push("=".repeat(48));
  lines.push(`Assistant : ${order.assistantName}`);
  lines.push(`Placed by : ${order.createdByEmail}`);
  lines.push(`Order date: ${order.orderDate}`);
  lines.push(`Urgency   : ${order.urgency}`);
  if (order.notes.trim()) lines.push(`Notes     : ${order.notes.trim()}`);
  lines.push("");
  const bySupplier = new Map<string, typeof order.lines>();
  for (const l of order.lines) {
    const s = l.supplier || "Other";
    if (!bySupplier.has(s)) bySupplier.set(s, []);
    bySupplier.get(s)!.push(l);
  }
  for (const [supplier, ls] of bySupplier) {
    lines.push(`${supplier.toUpperCase()}`);
    lines.push("-".repeat(supplier.length));
    for (const l of ls) lines.push(`  ${l.qty}x  ${l.name}  (${l.manufacturer ?? ""} ${l.unit ?? ""})`.trimEnd());
    lines.push("");
  }
  if (order.specialRequests.length) {
    lines.push("SPECIAL REQUESTS");
    lines.push("----------------");
    order.specialRequests.forEach((s, i) =>
      lines.push(`  ${i + 1}. ${s.text}${s.photoUrl ? "  [photo attached in PDF]" : ""}`),
    );
    lines.push("");
  }
  lines.push(`Total line items: ${order.lines.length}   Special requests: ${order.specialRequests.length}`);
  return lines.join("\n");
}

async function generatePdf(order: Order): Promise<Buffer> {
  return buildSupplyOrderPdf({
    orderNumber: order.id,
    assistantName: order.assistantName,
    orderDate: order.orderDate,
    urgency: order.urgency,
    notes: order.notes,
    createdByEmail: order.createdByEmail,
    lines: order.lines,
    specialRequests: order.specialRequests,
  });
}

export default withErrors(async (req, context) => {
  const url = new URL(req.url);
  const idParam = context.params?.id;
  const wantsPdf = url.pathname.endsWith("/pdf");

  // -------- collection --------
  if (!idParam) {
    if (req.method === "GET") {
      const user = await requireAuth(req);
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 50));
      const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
      const orders = await listOrders({
        onlyUserId: user.role === "admin" ? undefined : user.id,
        limit,
        offset,
      });
      return json({ orders });
    }

    if (req.method === "POST") {
      const user = await requireAuth(req);
      const input = await readJson(req, placeOrderSchema);
      const orderId = await placeSupplyOrder(user, input);
      const order = await getOrder(orderId);
      if (!order) throw new HttpError(500, "Order vanished after creation");

      const pdf = await generatePdf(order);
      const filename = pdfFilename(order);

      const mail = await sendOrderEmail({
        subject: `Asnan Dental — Supply Order #${order.id} — ${order.assistantName} — ${order.orderDate}`,
        text: plainText(order),
        cc: env.ccAssistant && order.createdByEmail.includes("@") ? [order.createdByEmail] : undefined,
        pdf,
        pdfFilename: filename,
      });
      await markOrderEmailed(order.id, mail.ok);
      await audit(user, "order.place", "order", order.id, {
        itemCount: order.itemCount,
        emailSent: mail.ok,
      });

      return json(
        {
          order: {
            id: order.id,
            createdAt: order.createdAt,
            createdByEmail: order.createdByEmail,
            assistantName: order.assistantName,
            orderDate: order.orderDate,
            urgency: order.urgency,
            itemCount: order.itemCount,
            emailSent: mail.ok,
          },
          pdfBase64: pdf.toString("base64"),
          pdfFilename: filename,
          emailSent: mail.ok,
          emailError: mail.error,
        },
        201,
      );
    }

    return methodNotAllowed(["GET", "POST"]);
  }

  // -------- single order --------
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, "Invalid order id");

  if (req.method === "GET") {
    const user = await requireAuth(req);
    const order = await getOrder(id);
    if (!order) throw new HttpError(404, "Order not found");
    if (user.role !== "admin" && order.createdByEmail.toLowerCase() !== user.email) {
      throw new HttpError(403, "Not your order");
    }
    if (wantsPdf) {
      const pdf = await generatePdf(order);
      return new Response(new Uint8Array(pdf), {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-disposition": `attachment; filename="${pdfFilename(order)}"`,
        },
      });
    }
    return json({ order });
  }

  if (req.method === "DELETE") {
    const admin = await requireAdmin(req);
    const ok = await deleteOrder(id);
    if (!ok) throw new HttpError(404, "Order not found");
    await audit(admin, "order.delete", "order", id);
    return json({ ok: true });
  }

  return methodNotAllowed(["GET", "DELETE"]);
});

export const config: Config = {
  path: ["/api/orders", "/api/orders/:id", "/api/orders/:id/pdf"],
};
