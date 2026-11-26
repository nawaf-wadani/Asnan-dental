import type { Config } from "@netlify/functions";
import { withErrors } from "../lib/handler";
import { json, readJson, methodNotAllowed, HttpError } from "../lib/http";
import { requireAuth, requireAdmin } from "../lib/auth";
import { receiveSchema } from "../lib/validation";
import { listReceiving, getReceivingOrder, applyReceipt, removeOrderLine } from "../lib/repos";
import { audit } from "../lib/audit";

/**
 * GET  /api/receiving   Orders still to receive, plus orders received in the last 30 days.
 * POST /api/receiving   { orderId, items: [{ lineId, qty }] }
 *   Marks units as received and adds them to stock. Any signed-in user can do this;
 *   a negative qty undoes an earlier receipt. Every change is written to the audit log.
 */
export default withErrors(async (req) => {
  if (req.method === "GET") {
    await requireAuth(req);
    return json({ orders: await listReceiving() });
  }

  if (req.method === "POST") {
    const user = await requireAuth(req);
    const { orderId, items } = await readJson(req, receiveSchema);
    const stock = await applyReceipt(user, orderId, items);
    const order = await getReceivingOrder(orderId);
    if (!order) throw new HttpError(404, "Order not found");
    await audit(user, "order.receive", "order", orderId, { items, stock });
    return json({ order, stock });
  }

  // DELETE /api/receiving?lineId=N  (admin): take one item out of an order.
  if (req.method === "DELETE") {
    const admin = await requireAdmin(req);
    const lineId = Number(new URL(req.url).searchParams.get("lineId"));
    if (!Number.isInteger(lineId) || lineId <= 0) throw new HttpError(400, "Say which item to remove");
    const removed = await removeOrderLine(lineId);
    if (!removed) throw new HttpError(404, "That item is no longer on the order");
    await audit(admin, "order.line.remove", "order", removed.orderId, {
      item: removed.name,
      qty: removed.qty,
      alreadyReceived: removed.receivedQty,
    });
    return json({ order: await getReceivingOrder(removed.orderId) });
  }

  return methodNotAllowed(["GET", "POST", "DELETE"]);
});

export const config: Config = {
  path: "/api/receiving",
};
