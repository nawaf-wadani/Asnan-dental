// Builds book.asnandental.ca into ./dist. No dependencies: `node build.mjs`.
//
// Output per clinic (see src/clinics.mjs):
//   /<clinic>/                landing page with that clinic's form
//   /<clinic>/<service>/      optional service pages, same form
//   /<clinic>/thank-you/      conversion page, reached only after a real submit
//
// Styling is newpatients.asnandental.ca's own stylesheet (src/newpatients.css)
// plus a few additions (src/book.css), so both sites look the same.
//
// After writing the pages, the build checks them and fails if a clinic page
// carries the other clinic's tag, a conversion snippet is anywhere but its own
// thank-you page, a page is missing noindex/title/description, or the visible
// copy contains a price, phone number or a banned advertising claim.

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, cp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  clinics, reasons, days, times, landing, services, HOURS, META_PIXEL_ID, PRIVACY_URL,
} from "./src/clinics.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, "dist");
const year = new Date().getFullYear();

const css = (await readFile(join(root, "src/newpatients.css"), "utf8")) + (await readFile(join(root, "src/book.css"), "utf8"));
const js = await readFile(join(root, "src/assets/book.js"), "utf8");
const wordmark = (await readFile(join(root, "src/wordmark.svg"), "utf8")).trim();
const v = (s) => createHash("sha256").update(s).digest("hex").slice(0, 10);
const cssUrl = `/assets/styles.css?v=${v(css)}`;
const jsUrl = `/assets/book.js?v=${v(js)}`;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fill = (s, c) =>
  String(s).replaceAll("{clinic}", c.fullName).replaceAll("{name}", c.name).replaceAll("{area}", c.area);
const mapsUrl = (c) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(c.mapsQuery);

// ---- Tracking fragments -------------------------------------------------

const metaPixel = `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('set', 'autoConfig', false, '${META_PIXEL_ID}');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none" alt=""
src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`;

// Runs first on a thank-you page. book.js stores a one-time token just before it
// redirects here, and only after Netlify has accepted the form. No token means no
// real submit (direct visit, reload, shared link): go to the form instead.
const thankYouGuard = (c) => `<script>
  (function () {
    var key = 'asnan-submission-${c.slug}', raw = null;
    try { raw = sessionStorage.getItem(key); sessionStorage.removeItem(key); } catch (e) {}
    var m = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
    if (m) {
      raw = raw || decodeURIComponent(m[1]);
      document.cookie = key + '=; Max-Age=0; Path=/${c.slug}/; Secure; SameSite=Lax';
    }
    if (raw) {
      var parts = raw.split('|');
      window.asnanSubmissionId = parts[0];
      window.asnanRequestType = parts[1] || 'New patient request';
    } else {
      window.location.replace('/${c.slug}/' + window.location.search);
    }
  })();
</script>`;

// The supplied event snippet, fired only for a real submission. transaction_id
// lets Google Ads drop any duplicate of the same submission.
const conversionSnippet = (c) => `${c.conversionComment}
<script>
  if (window.asnanSubmissionId) {
    gtag('event', 'conversion', {'send_to': '${c.conversionSendTo}', 'transaction_id': window.asnanSubmissionId});
  }
</script>`;

// Same Lead event as newpatients ("<request type> - <clinic>"), once per submission.
const metaLead = (c) => `<script>
  if (window.asnanSubmissionId) {
    fbq('track', 'Lead', {content_name: window.asnanRequestType + ' - ${c.name}'}, {eventID: window.asnanSubmissionId});
  }
</script>`;

// ---- Page chrome ----------------------------------------------------------

function head({ title, description, top = "", bottom = "" }) {
  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${top}
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#785FE0">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/alexandria-latin-300-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/alexandria-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${cssUrl}">
${bottom}
</head>`;
}

const pinIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`;

function topBar(c) {
  const brand = c
    ? `<a class="brand" href="/${c.slug}/" data-keep-query aria-label="${esc(c.fullName)}">${wordmark}</a>`
    : `<span class="brand" role="img" aria-label="Asnan Dental">${wordmark}</span>`;
  const pill = c
    ? `<span class="call-pill clinic-pill">${pinIcon}<span class="long">${esc(c.name)}, ${esc(c.area)}</span><span class="short">${esc(c.name)}</span></span>`
    : "";
  return `<div class="top">
  <header class="site-header wrap">
    ${brand}
    ${pill}
  </header>
</div>`;
}

function footer(c, { note = true } = {}) {
  const clinicBlock = c
    ? `<div class="clinic-list">
    <p><strong>${esc(c.name)}</strong><br>${esc(c.street)}, ${esc(c.locality)}</p>
    <p><strong>${HOURS}</strong><br>Languages: ${esc(c.languages)}</p>
    <p><a href="${mapsUrl(c)}" target="_blank" rel="noopener">Directions in Google Maps</a></p>
  </div>`
    : `<div class="clinic-list"></div>`;
  return `<footer class="site-footer wrap">
  ${clinicBlock}
  <p class="legal">&copy; ${year} Asnan Dental. <a href="${PRIVACY_URL}">Privacy policy</a>.${note ? " This page uses Google and Meta tags to measure our ads." : ""}</p>
</footer>`;
}

// ---- The form -------------------------------------------------------------

function form(c, page) {
  const chip = (type, name, value, label, checked) =>
    `<label class="chip"><input type="${type}" name="${name}" value="${esc(value)}"${checked ? " checked" : ""}><span>${esc(label)}</span></label>`;
  const hidden = [
    "ref", "came_from", "landing_page",
    "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
    "gclid", "gbraid", "wbraid", "fbclid",
  ].map((n) => `<input type="hidden" name="${n}" value="">`).join("\n        ");

  return `<section class="panel" id="request" aria-labelledby="form-title">
    <h2 class="panel-title" id="form-title">${esc(page.formTitle)}</h2>
    <p class="form-error" id="form-error" role="alert" hidden></p>
    <form name="${c.formName}" id="booking" method="POST" action="/${c.slug}/thank-you/" data-netlify="true" netlify-honeypot="bot-field" novalidate
      data-clinic="${c.slug}" data-clinic-name="${esc(c.name)}" data-thanks="/${c.slug}/thank-you/" data-subject="${esc(page.requestType)}">
        <input type="hidden" name="form-name" value="${c.formName}">
        <input type="hidden" name="subject" value="${esc(page.requestType)}: ${esc(c.name)} (book.asnandental.ca)">
        <input type="hidden" name="request_type" value="${esc(page.requestType)}">
        <input type="hidden" name="clinic" value="${esc(c.name)}">
        ${hidden}
        <p class="visually-hidden" aria-hidden="true"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>

        <p class="your-clinic">Your clinic</p>
        <div class="clinic-static${c.variant === "bank" ? " clinic-static--bank" : ""}">
          <span class="clinic-name">${esc(c.name)}</span>
          <span class="clinic-addr">${esc(c.shortAddress)}</span>
          <span class="clinic-lang">${esc(c.languages)}</span>
        </div>

        <fieldset class="section">
          <legend class="visually-hidden">Your details</legend>
          <div class="field">
            <label class="label" for="name">Your name</label>
            <input type="text" id="name" name="name" autocomplete="name" required aria-describedby="name-error">
            <p class="error" id="name-error"></p>
          </div>
          <div class="grid-2">
            <div class="field">
              <label class="label" for="phone">Phone</label>
              <input type="tel" id="phone" name="phone" autocomplete="tel-national" inputmode="tel" required aria-describedby="phone-error">
              <p class="error" id="phone-error"></p>
            </div>
            <div class="field">
              <label class="label" for="email">Email</label>
              <input type="email" id="email" name="email" autocomplete="email" inputmode="email" required aria-describedby="email-error">
              <p class="error" id="email-error"></p>
            </div>
          </div>
        </fieldset>

        <fieldset class="section">
          <legend class="visually-hidden">Your visit</legend>
          <fieldset class="choice-group">
            <legend class="group-label">Reason for visit</legend>
            <div class="chips">
              ${reasons.map((r) => chip("radio", "reason", r.value, r.label, r.value === page.reason)).join("\n              ")}
            </div>
          </fieldset>
          <details class="more">
            <summary>Add a preferred time or note</summary>
            <fieldset class="choice-group">
              <legend class="group-label">Preferred days</legend>
              <div class="chips chips--days">
                ${days.map((d) => chip("checkbox", "preferred_days", d, d, false)).join("\n                ")}
              </div>
            </fieldset>
            <fieldset class="choice-group">
              <legend class="group-label">Preferred time</legend>
              <div class="chips chips--3">
                ${times.map((t, i) => chip("radio", "preferred_time", t, t, i === 0)).join("\n                ")}
              </div>
            </fieldset>
            <div class="field">
              <label class="label" for="notes">Note</label>
              <textarea id="notes" name="notes" rows="3" maxlength="800" placeholder="Please leave out health details"></textarea>
            </div>
          </details>
        </fieldset>

        <label class="consent">
          <input type="checkbox" name="consent" value="Yes" required aria-describedby="consent-error">
          <span>Asnan Dental may contact me about this request by phone, text or email. See our <a href="${PRIVACY_URL}" target="_blank" rel="noopener">privacy policy</a>.</span>
        </label>
        <p class="error" id="consent-error"></p>

        <div class="actions">
          <button class="submit" type="submit" id="submit">${esc(page.button)}</button>
        </div>
    </form>
  </section>`;
}

// ---- Pages ----------------------------------------------------------------

function clinicHead(c, { title, description, thankYou = false }) {
  return head({
    title,
    description,
    top: [thankYou ? thankYouGuard(c) : "", c.googleTag, thankYou ? conversionSnippet(c) : ""].filter(Boolean).join("\n"),
    bottom: [`<script src="${jsUrl}" defer></script>`, metaPixel, thankYou ? metaLead(c) : ""].filter(Boolean).join("\n"),
  });
}

function landingPage(c, page) {
  const about = page.about
    ? `<section aria-labelledby="about-title">
      <h2 class="next-title" id="about-title">${esc(page.about.heading)}</h2>
      ${page.about.paragraphs.map((p) => `<p>${esc(fill(p, c))}</p>`).join("\n      ")}
      <p class="fine-print">${esc(page.about.footnote)}</p>
    </section>
    `
    : "";
  return `${clinicHead(c, { title: fill(page.title, c), description: fill(page.description, c) })}
<body>
<a class="skip" href="#request">Skip to the form</a>
${topBar(c)}
<main class="wrap layout" id="main">
  <div class="band" aria-hidden="true"></div>
  <section class="hero" aria-labelledby="page-title">
    <p class="eyebrow">${esc(page.eyebrow)}</p>
    <h1 class="headline" id="page-title">${page.headline.map((l) => `<span>${esc(l)}</span>`).join(" ")}</h1>
    <p class="support">${esc(fill(page.support, c))}</p>
    ${page.heroNote ? `<p class="hero-note">${esc(page.heroNote)}</p>` : ""}
  </section>
  ${form(c, page)}
  <div class="aside">
    ${about}<section aria-labelledby="next-title">
      <h2 class="next-title" id="next-title">What happens next</h2>
      <ol class="next">
        <li>Send your request with this form.</li>
        <li>Our ${esc(c.name)} team calls you to find a day and time.</li>
        <li>Come in to ${esc(c.street)}, ${esc(c.area)}.</li>
      </ol>
    </section>
  </div>
</main>
${footer(c)}
</body>
</html>
`;
}

function thankYouPage(c) {
  return `${clinicHead(c, {
    title: `Request sent | ${c.fullName}`,
    description: `Your request to ${c.fullName} has been sent. Our ${c.name} team will call you to book your visit.`,
    thankYou: true,
  })}
<body>
${topBar(c)}
<main class="wrap layout" id="main">
  <div class="band" aria-hidden="true"></div>
  <section class="hero thanks" aria-labelledby="page-title">
    <p class="eyebrow">Request sent</p>
    <h1 class="headline" id="page-title"><span>Thank you.</span> <span>We'll call you soon.</span></h1>
    <p class="support">Our ${esc(c.name)} team will call you to find a day and time for your visit.</p>
    <p class="talk"><strong>${esc(c.fullName)}</strong>${esc(c.street)}, ${esc(c.locality)}<br>${HOURS}<br><a href="${mapsUrl(c)}" target="_blank" rel="noopener">Directions in Google Maps</a></p>
    <a class="back" href="/${c.slug}/" data-keep-query>Back to the ${esc(c.name)} page</a>
  </section>
</main>
${footer(c)}
</body>
</html>
`;
}

function plainPage({ title, eyebrow, lines, text }) {
  return `${head({ title, description: text })}
<body>
${topBar(null)}
<main class="wrap layout" id="main">
  <div class="band" aria-hidden="true"></div>
  <section class="hero thanks" aria-labelledby="page-title">
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h1 class="headline" id="page-title">${lines.map((l) => `<span>${esc(l)}</span>`).join(" ")}</h1>
    <p class="support">${esc(text)}</p>
    <a class="back" href="https://asnandental.ca/">Go to asnandental.ca</a>
  </section>
</main>
${footer(null, { note: false })}
</body>
</html>
`;
}

// ---- Write ----------------------------------------------------------------

const files = new Map();
const rewrites = [];

for (const c of clinics) {
  files.set(`${c.slug}/index.html`, landingPage(c, landing));
  rewrites.push(`/${c.slug}`);
  for (const s of c.services) {
    if (!services[s]) throw new Error(`Unknown service "${s}" for ${c.slug}`);
    files.set(`${c.slug}/${s}/index.html`, landingPage(c, services[s]));
    rewrites.push(`/${c.slug}/${s}`);
  }
  files.set(`${c.slug}/thank-you/index.html`, thankYouPage(c));
  rewrites.push(`/${c.slug}/thank-you`);
}

files.set("index.html", plainPage({
  title: "Asnan Dental",
  eyebrow: "Asnan Dental",
  lines: ["Looking for", "Asnan Dental?"],
  text: "This address is for appointment requests from our ads. Our website has everything about our clinics.",
}));
files.set("404.html", plainPage({
  title: "Page not found | Asnan Dental",
  eyebrow: "Page not found",
  lines: ["We couldn't find", "that page."],
  text: "The link may be out of date. Our website has everything about our clinics.",
}));

// Serve every clinic page with or without a trailing slash as a rewrite (no
// redirect), so the ad's query string always reaches the page untouched.
files.set("_redirects", "# Generated by build.mjs\n" + rewrites.map((p) => `${p}  ${p}/index.html  200!`).join("\n") + "\n");

await rm(out, { recursive: true, force: true });
for (const [path, body] of files) {
  await mkdir(dirname(join(out, path)), { recursive: true });
  await writeFile(join(out, path), body);
}
await cp(join(root, "src/assets"), join(out, "assets"), { recursive: true });
await writeFile(join(out, "assets/styles.css"), css);

// ---- Checks ---------------------------------------------------------------

const problems = [];
const visibleText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ");
const banned = [
  [/\$\s?\d/, "a price"],
  [/\d+\s?%\s?off/i, "a discount"],
  [/\b(free|discount|promo(tion)?s?|special offer|deal)\b/i, "a promotion"],
  [/\b(best|#\s?1|number one|top-rated|leading)\b/i, "a superlative or comparison"],
  [/\b(guarantee[ds]?|painless|pain-free)\b/i, "a guarantee or painless claim"],
  [/\b(testimonials?|reviews?|stars?|rated)\b/i, "a testimonial or review"],
  [/\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}\b/, "a phone number"],
];
const titles = new Set();

for (const [path, html] of files) {
  if (!path.endsWith(".html")) continue;
  const owner = clinics.find((c) => path.startsWith(c.slug + "/"));
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) problems.push(`${path}: no <title>`);
  else if (titles.has(title)) problems.push(`${path}: duplicate title "${title}"`);
  else titles.add(title);
  if (!/<meta name="description" content="[^"]{40,}">/.test(html)) problems.push(`${path}: no meta description`);
  if (!/<meta name="robots" content="noindex/.test(html)) problems.push(`${path}: not noindex`);
  if (/href="tel:/i.test(html)) problems.push(`${path}: has a tel: link`);

  for (const c of clinics) {
    const hasTag = html.includes(c.googleAdsId);
    const hasConversion = html.includes(c.conversionSendTo);
    if (c === owner) {
      if (!html.includes(c.googleTag)) problems.push(`${path}: missing its own Google tag`);
      const isThanks = path === `${c.slug}/thank-you/index.html`;
      if (isThanks !== hasConversion) problems.push(`${path}: conversion snippet ${isThanks ? "missing" : "must not be here"}`);
      if (isThanks && html.indexOf(c.conversionSendTo) < html.indexOf(c.googleTag)) problems.push(`${path}: conversion snippet above the tag`);
      if (html.indexOf(c.googleTag) > html.indexOf("</head>")) problems.push(`${path}: Google tag not in <head>`);
    } else if (hasTag || hasConversion) {
      problems.push(`${path}: carries ${c.name}'s Google tag or conversion`);
    }
  }
  if (!owner && /fbq\(|gtag\(|AW-\d/.test(html)) problems.push(`${path}: tracking on a non-clinic page`);

  const text = visibleText(html);
  for (const [re, what] of banned) {
    const m = text.match(re);
    if (m) problems.push(`${path}: copy contains ${what} ("${m[0]}")`);
  }
}

// Pages that share a form name must send exactly the same field names, or
// Netlify drops the fields it didn't register.
const formFields = new Map();
for (const [path, html] of files) {
  for (const fm of html.matchAll(/<form name="([^"]+)"[\s\S]*?<\/form>/g)) {
    const names = [...new Set([...fm[0].matchAll(/ name="([^"]+)"/g)].map((m) => m[1]).filter((n) => n !== fm[1]))].sort().join(",");
    const seen = formFields.get(fm[1]);
    if (seen && seen.names !== names) problems.push(`${path}: form "${fm[1]}" fields differ from ${seen.path}`);
    else formFields.set(fm[1], { names, path });
  }
}

if (problems.length) {
  console.error("Build checks failed:\n  " + problems.join("\n  "));
  process.exit(1);
}
const pages = [...files.keys()].filter((p) => p.endsWith(".html")).sort();
console.log(`Built ${pages.length} pages into dist/. All checks passed.`);
for (const p of pages) console.log("  /" + p.replace(/index\.html$/, ""));
