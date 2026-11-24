import type { Config } from "@netlify/functions";
import { withErrors } from "../lib/handler";
import { json, readJson, methodNotAllowed, HttpError } from "../lib/http";
import { requireAuth } from "../lib/auth";
import { receiveSchema } from "../lib/validation";
import { listReceiving, getReceivingOrder, applyReceipt } from "../lib/repos";
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

  return methodNotAllowed(["GET", "POST"]);
});

export const config: Config = {
  path: "/api/receiving",
};
