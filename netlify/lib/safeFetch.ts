import { lookup } from "node:dns/promises";
import net from "node:net";
import { HttpError } from "./http";

/**
 * Fetches a web page an admin pasted in, without letting that link reach our own
 * network: https only, no IP addresses, every address the name resolves to must be
 * public, redirects are followed by hand (and re-checked), the wait is short and the
 * download is capped.
 */

const UA = "AsnanDentalInventory/1.0 (clinic supply ordering)";
const MAX_HTML_BYTES = 1_500_000;

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    return v === "::" || v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:");
  }
  return true;
}

async function assertPublicUrl(u: URL): Promise<void> {
  if (u.protocol !== "https:") throw new HttpError(400, "Use a link that starts with https://");
  const host = u.hostname;
  if (net.isIP(host) || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new HttpError(400, "Use the address of a public website");
  }
  let addrs: { address: string }[];
  try {
    addrs = await lookup(host, { all: true });
  } catch {
    throw new HttpError(422, "That website address could not be found");
  }
  if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) {
    throw new HttpError(400, "Use the address of a public website");
  }
}

async function readLimited(res: Response, max: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return (await res.text()).slice(0, max);
  const decoder = new TextDecoder();
  let out = "";
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    out += decoder.decode(value, { stream: true });
    if (size >= max) {
      await reader.cancel();
      break;
    }
  }
  return out;
}

export type Fetched = { kind: "image"; url: string } | { kind: "html"; html: string; url: string };

export async function fetchPublic(raw: string): Promise<Fetched> {
  let current: URL;
  try {
    current = new URL(raw);
  } catch {
    throw new HttpError(400, "That doesn't look like a web address");
  }

  for (let hop = 0; hop < 4; hop++) {
    await assertPublicUrl(current);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(current, {
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "user-agent": UA, accept: "text/html,image/*;q=0.9" },
      });
      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        current = new URL(location, current);
        continue;
      }
      if (!res.ok) {
        throw new HttpError(
          422,
          `That website answered with error ${res.status}. If it blocks automatic lookups, save the picture and use Upload instead`,
        );
      }
      const type = (res.headers.get("content-type") ?? "").toLowerCase();
      if (type.startsWith("image/")) {
        await res.body?.cancel();
        return { kind: "image", url: current.toString() };
      }
      if (!type.includes("text/html")) throw new HttpError(422, "That link is not a web page or a picture");
      return { kind: "html", html: await readLimited(res, MAX_HTML_BYTES), url: current.toString() };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(422, "That website did not answer in time. Try again, or save the picture and use Upload instead");
    } finally {
      clearTimeout(timer);
    }
  }
  throw new HttpError(422, "That link redirects too many times");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function metaContent(html: string, names: string[]): string | null {
  for (const n of names) {
    const tag = new RegExp(`<meta[^>]+(?:property|name)=["']${n}["'][^>]*>`, "i").exec(html)?.[0];
    const tag2 = new RegExp(`<meta[^>]+content=["'][^"']*["'][^>]+(?:property|name)=["']${n}["'][^>]*>`, "i").exec(html)?.[0];
    const found = tag ?? tag2;
    if (!found) continue;
    const c = /content=["']([^"']+)["']/i.exec(found);
    if (c) return decodeEntities(c[1]).trim();
  }
  return null;
}

/** Picks the main picture of a product page: Open Graph / Twitter image, then structured data. */
export function findPageImage(html: string, pageUrl: string): { image: string | null; title: string | null } {
  const title = metaContent(html, ["og:title", "twitter:title"]) ?? decodeEntities(/<title[^>]*>([^<]*)/i.exec(html)?.[1] ?? "").trim() ?? null;
  let candidate =
    metaContent(html, ["og:image:secure_url", "og:image", "twitter:image", "twitter:image:src"]) ??
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i.exec(html)?.[1] ??
    /"image"\s*:\s*\[?\s*"([^"]+)"/.exec(html)?.[1] ??
    null;
  if (!candidate) return { image: null, title: title || null };
  try {
    const abs = new URL(decodeEntities(candidate).replace(/\\\//g, "/"), pageUrl);
    if (abs.protocol === "http:") abs.protocol = "https:";
    if (abs.protocol !== "https:" || abs.toString().length > 2000) return { image: null, title: title || null };
    candidate = abs.toString();
  } catch {
    return { image: null, title: title || null };
  }
  return { image: candidate, title: title || null };
}
