# Deploying Asnan Dental to Netlify

One-time setup. After this, every `git push` auto-builds and deploys.

---

## 1. Create the GitHub repository (~3 min)

You don't have a GitHub account yet — you need one (free) so Netlify can build
from source (that's what ships the serverless functions; the previous manual
upload didn't).

1. Go to <https://github.com/signup>. Use `nawaf@asnandental.ca`. Verify the email.
2. Go to <https://github.com/new>.
   - **Repository name:** `asnan-dental`
   - **Private** (important — this is internal software)
   - Do **not** add a README, .gitignore, or license (the repo already has them)
   - Click **Create repository**.
3. Leave that page open — you'll need the URL, which looks like
   `https://github.com/<your-username>/asnan-dental.git`.

## 2. Push this code

In a terminal in `C:\Users\Nawal\asnan-dental` (Claude can run these for you —
just say "push it" and paste your repo URL):

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/asnan-dental.git
git push -u origin main
```

The first push opens a browser window to sign in to GitHub — approve it. Git for
Windows remembers it after that.

## 3. Generate the Gmail / Google Workspace App Password (~2 min)

The app sends order PDFs from **`Orders@asnandental.ca`**. Google requires an
"App Password" for SMTP.

1. Sign in to that mailbox at <https://mail.google.com>.
2. <https://myaccount.google.com/security> → turn on **2-Step Verification** if it
   isn't already.
3. <https://myaccount.google.com/apppasswords> → name it `Asnan Orders` →
   **Create**. Copy the 16-character password (no spaces).
   *If that page says it's unavailable, 2-Step Verification isn't fully on yet.*

Keep this value for step 5 (`SMTP_PASS`).

## 4. Connect the repo to Netlify

1. <https://app.netlify.com> (sign in with Google — `nawaf@asnandental.ca`).
2. **Add new site → Import an existing project → GitHub.** Authorize Netlify,
   pick **`asnan-dental`**.
3. Build settings are read from `netlify.toml` — leave them as detected:
   - Build command: `npm run build`
   - Publish directory: `dist/client`
4. **Before the first deploy**, open **Site configuration → Environment variables**
   and add the values from step 5. (Or click "Deploy" now, add them, then
   "Trigger deploy" — the first build may fail without them, that's fine.)
5. Netlify provisions the Postgres database automatically on the first deploy
   because `@netlify/database` is a dependency. Migrations in
   `netlify/database/migrations/` run as part of that deploy.

## 5. Environment variables (set in Netlify)

| Key | Value |
|---|---|
| `AUTH_SECRET` | *(generate — see below; keep it secret)* |
| `ADMIN_EMAIL` | `Nawaf@asnandental.ca` |
| `ADMIN_PASSWORD` | *(a strong password you choose — used only for the very first login)* |
| `SESSION_HOURS` | `12` |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `Orders@asnandental.ca` |
| `SMTP_PASS` | *(the 16-char App Password from step 3)* |
| `SMTP_FROM` | `Asnan Dental Orders <Orders@asnandental.ca>` |
| `ORDER_EMAIL_TO` | `Nawaf@asnandental.ca,Orders@asnandental.ca` |
| `ORDER_EMAIL_CC_ASSISTANT` | `true` |
| `APP_ORIGIN` | `https://asnan-orders.netlify.app` (or your custom domain later) |

**Generate `AUTH_SECRET`** — any long random string works. Easiest: in the Netlify
env var dialog just mash 50+ random characters, or run this anywhere with Node/
OpenSSL: `openssl rand -base64 48`.

> Claude can set all of these for you through the Netlify connection — give it the
> App Password and the admin password you want and say "set the Netlify env vars".

## 6. First login

1. After a successful deploy, open the site.
2. Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. This creates the real admin
   account and seeds the ~200-item catalog.
3. Go to **Admin → Users** and create accounts for each assistant.
4. **Change the admin password** (Admin → Users → your row → Reset password), then
   you can blank out `ADMIN_PASSWORD` in Netlify if you like.
5. Set opening stock counts in **Inventory** (or Admin → Catalog per item).

## 7. Rename the site / custom domain (optional)

Site configuration → **Change site name** → `asnan-orders` →
`asnan-orders.netlify.app`. To use `orders.asnandental.ca`, add it under
**Domain management** and create the CNAME it shows you.

---

## Routine changes later

```bash
git add -A && git commit -m "what changed" && git push
```

Netlify builds and deploys in ~2 min. Pull requests get their own preview URL with
an isolated copy of the database.
