# book.asnandental.ca — ad landing pages

Ad-only new-patient pages, one set per clinic. Separate from the supply app in
the rest of this repo and from `newpatients.asnandental.ca` (Netlify project
`asnan-book`). Hosted on Netlify project **`asnan-book-ads`**.

| Page | Purpose |
|---|---|
| `/hazeldean` | Hazeldean landing page and form (clinic fixed) |
| `/hazeldean/invisalign` | Invisalign consultation page, same form |
| `/hazeldean/thank-you/` | Conversion page, reached only after a real submit |
| `/bank-street` | Bank Street landing page and form (clinic fixed) |
| `/bank-street/invisalign` | Invisalign consultation page, same form |
| `/bank-street/thank-you/` | Conversion page, reached only after a real submit |
| `/` and 404 | Plain page, no tracking, no clinic chooser |

## Where the pages are live

The ads use the **newpatients.asnandental.ca** copy (Netlify project `asnan-book`):

| Page | URL |
|---|---|
| Hazeldean | `https://newpatients.asnandental.ca/googlehazeldean` (also `/googlehazeldain`) |
| Hazeldean Invisalign | `https://newpatients.asnandental.ca/googlehazeldean/invisalign` |
| Bank Street | `https://newpatients.asnandental.ca/googlebankstreet` |
| Bank Street Invisalign | `https://newpatients.asnandental.ca/googlebankstreet/invisalign` |

The same pages at `/<clinic>/` on `asnan-book-ads.netlify.app` (and later
`book.asnandental.ca`) come from the default build below.

## Build

```bash
node build.mjs     # writes dist/ for asnan-book-ads, no dependencies

# Same pages into the newpatients site (repo nawaf-wadani/asnan-calls), at each
# clinic's newpatientsSlug. Writes googlehazeldean/, googlebankstreet/, _redirects
# and assets/book-ads.{css,js}; leaves everything else in that folder alone.
node build.mjs --newpatients ../../asnan-calls/new-patient-booking
```

Then deploy that folder to Netlify project `asnan-book`. Its `netlify.toml`
applies the strict Content-Security-Policy to newpatients' own pages only, not to
`/googlehazeldean/*` or `/googlebankstreet/*`, because it would block the Google
Ads tag. Newpatients form entries arrive under the same form names in project
`asnan-book`.

The build fails if:

- a Hazeldean page carries the Bank Street Google tag or conversion, or the other way round;
- a conversion snippet is anywhere but its own clinic's thank-you page;
- a page lacks `noindex`, a title or a meta description;
- the visible copy has a price, phone number, promotion, superlative, guarantee,
  "painless" or a testimonial/review.

## How tracking works

- Every `/hazeldean/*` page has the Hazeldean Google tag (`AW-18489860703`) in
  `<head>`; every `/bank-street/*` page has the Bank Street tag (`AW-18554348744`).
  The snippets are in `src/clinics.mjs`, exactly as supplied.
- The form posts to Netlify Forms (`book-hazeldean`, `book-bank-street`). Only when
  Netlify accepts it does `src/assets/book.js` store a one-time token and go to the
  thank-you page, keeping the query string (`gclid`, `utm_*`).
- The thank-you page reads and deletes that token before anything else. With a
  token it fires the clinic's conversion event once, with
  `transaction_id` = the submission's `ref` (also saved in the form entry), and a
  Meta `Lead`. Without one (direct visit, reload, shared link) it goes back to the
  form and fires nothing.
- `gclid`, `gbraid`, `wbraid`, `fbclid`, the UTM tags, `came_from` and the
  landing page URL are saved with every form entry.
- Meta Pixel `4672127656389507` loads on clinic pages (PageView, plus Lead on a
  real submit). Nothing on the page depends on it or on gtag.

To test the conversion, submit the form for real. Opening a thank-you URL
directly is meant to redirect to the form.

## Editing

- Copy, clinic facts, reasons, service pages: `src/clinics.mjs`.
- Markup: `build.mjs`. Styles: `src/newpatients.css` is copied unchanged from
  newpatients.asnandental.ca; additions go in `src/book.css`.
- New service page for a clinic: add an entry to `services` and its key to the
  clinic's `services` list.

Content rules: no prices or promotions unless the clinic confirms them in writing,
no testimonials/reviews, no "best"/"#1"/comparisons, no guarantees, no "painless",
and no phone number until each clinic confirms the right one.

## Netlify setup (project `asnan-book-ads`)

- Base directory `book-site` if connected to Git; build `node build.mjs`, publish `dist`.
- Forms: enabled. Add email notifications for `book-hazeldean` and
  `book-bank-street` under Forms → Form notifications.
- Domain: `book.asnandental.ca` (HTTPS certificate is issued automatically once DNS
  points at Netlify). DNS is in Cloudflare (MediaNV's account): CNAME `book` →
  `asnan-book-ads.netlify.app`, **DNS only** (grey cloud), or Netlify can't issue
  the certificate. Never move the domain's nameservers to Netlify.
- Netlify address → real domain: `REDIRECT_NETLIFY_HOST` in `build.mjs` adds
  `https://asnan-book-ads.netlify.app/* → https://book.asnandental.ca/:splat 301!`
  at the top of `_redirects` (path and query string kept). Turn it on only after
  `https://book.asnandental.ca` loads with a valid certificate, then redeploy.
