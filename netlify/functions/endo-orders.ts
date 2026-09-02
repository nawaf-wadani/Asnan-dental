import type { Config } from "@netlify/functions";
import { withErrors } from "../lib/handler";
import { json, readJson, methodNotAllowed } from "../lib/http";
import { requireAuth } from "../lib/auth";
import { endoOrderSchema } from "../lib/validation";
import { placeEndoOrder, markEndoEmailed } from "../lib/repos";
import { audit } from "../lib/audit";
import { buildEndoOrderPdf } from "../lib/pdf";
import { sendOrderEmail } from "../lib/email";
import { env } from "../lib/env";

export default withErrors(async (req) => {
  if (req.method !== "POST") return methodNotAllowed(["POST"]);

  const user = await requireAuth(req);
  const input = await readJson(req, endoOrderSchema);
  const id = await placeEndoOrder(user, input);

  const pdf = await buildEndoOrderPdf({
    orderNumber: id,
    dentist: input.dentist,
    orderDate: input.orderDate,
    urgency: input.urgency,
    notes: input.notes,
    createdByEmail: user.email,
    files: input.files,
    accessories: input.accessories,
  });
  const filename = `Asnan-WaveOne-Order-${id}-${input.orderDate}.pdf`;

  const text = [
    `ASNAN DENTAL — WAVEONE ENDO SUPPLY ORDER #${id}`,
    "=".repeat(48),
    `Dentist  : ${input.dentist}`,
    `Placed by: ${user.email}`,
    `Date     : ${input.orderDate}`,
    `Urgency  : ${input.urgency}`,
    "",
    "FILES ORDERED",
    "-------------",
    ...input.files.map((f) => `  ${f.qty}x  ${f.type} — ${f.taper} — ${f.length}`),
    ...(input.accessories.length ? ["", "ACCESSORIES", "-----------", ...input.accessories.map((a) => `  • ${a}`)] : []),
    ...(input.notes.trim() ? ["", `NOTES: ${input.notes.trim()}`] : []),
  ].join("\n");

  const mail = await sendOrderEmail({
    subject: `Asnan Dental — WaveOne Endo Order #${id} — ${input.dentist} — ${input.orderDate}`,
    text,
    cc: env.ccAssistant && user.email.includes("@") ? [user.email] : undefined,
    pdf,
    pdfFilename: filename,
  });
  await markEndoEmailed(id, mail.ok);
  await audit(user, "endo_order.place", "endo_order", id, { emailSent: mail.ok });

  return json(
    { id, pdfBase64: pdf.toString("base64"), pdfFilename: filename, emailSent: mail.ok, emailError: mail.error },
    201,
  );
});

export const config: Config = {
  path: "/api/endo-orders",
};
