import type { Context } from "@netlify/functions";
import { errorResponse } from "./http";

export type Handler = (req: Request, context: Context) => Promise<Response>;

/** Wraps a handler so thrown HttpErrors become clean JSON responses and
 *  anything else becomes a 500 without leaking internals. */
export function withErrors(fn: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      return errorResponse(err);
    }
  };
}
