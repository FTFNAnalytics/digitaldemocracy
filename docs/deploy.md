# Deploy

Production is the Next.js standalone server (`npm start` → `.next/standalone/server.js`) behind nginx 1.24 on the Ubuntu VPS. `npm run build` runs `next build` and then `scripts/prepare-standalone.mjs`, which copies `.next/static` and `public/` into the standalone tree. The copy step exits non-zero if `.next/static/chunks` contains no `.css` file or if the copied file count does not match the source, and it prints every copied path and size.

Verified 2026-09-23 22:28 UTC: `GET https://center4digitaldemocracy.com/` returned 200 (`nginx/1.24.0`, `x-nextjs-prerender: 1`) while the stylesheet it referenced, `/_next/static/chunks/<hash>.css`, returned HTTP 500 with the 21-byte body `Internal Server Error`. JavaScript chunks beside that file returned 200, so the site rendered unstyled. A missing or unreadable CSS file is enough to produce that split: an `EACCES` on read is a 500, not a 404. This document does not SSH, deploy, or change production. Justin runs the checklist below on the VPS.

## Production sequence

On the VPS, in the deployed repository root (the directory that contains `package.json` and `.next/standalone`), in this order:

```bash
git pull
npm ci
CONTENT_ALLOW_PLACEHOLDERS=1 npm run build
sudo systemctl restart <unit>
npm run smoke -- https://center4digitaldemocracy.com
```

`<unit>` is the systemd unit whose process is `node .next/standalone/server.js`. It is not named in this repository; find it with the commands in the next section before restarting.

`npm run build` runs `scripts/check-content-placeholders.mjs`, then `next build`, then `scripts/prepare-standalone.mjs`. The placeholder check exits non-zero when `app/`, `components/`, or `lib/` still contain a visible `[CONFIRM: …]` fact, unless `CONTENT_ALLOW_PLACEHOLDERS=1`. Those placeholders are the public copy until the fact is supplied. A production build that should keep them on the page must export that variable. CI sets it. Restart only after `npm run build` exits 0. Restarting between `next build` and the copy step serves HTML from the new build against a static tree that was not copied yet, which is the hash-mismatch failure in checklist step b.

`npm run smoke` fetches the homepage, then every `/_next/static/...` `href` and `src` it references, prints a table of status and body bytes, and exits non-zero if the homepage or any of those assets is not HTTP 200, or if the page references no stylesheet.

## Find the service unit

```bash
ps -eo user,pid,cmd | grep 'standalone/server.js' | grep -v grep
systemctl list-units --type=service --all --no-pager | grep -Ei 'node|next|cdd|democracy'
systemctl show <unit> -p User -p Group -p WorkingDirectory -p ExecStart
```

`WorkingDirectory` from that `systemctl show` is `APP_ROOT` in the checklist. An empty `User` means the unit default; use the user from `ps`. [`docs/atlas-plan.md`](atlas-plan.md) expects the web user (often `www-data`) to be able to read published files. The Next process does not need write access to the SQLite master.

## Diagnosis checklist

Run over SSH, in this order. Each step separates a different cause of "HTML 200, one CSS chunk 500, JS chunks 200".

### a. Ownership and mode of the CSS chunks

An `EACCES` while Node reads a stylesheet produces HTTP 500, not 404. Compare the CSS files with the user the service runs as.

```bash
APP_ROOT=$(systemctl show <unit> -p WorkingDirectory --value)
SVC_USER=$(systemctl show <unit> -p User --value)
echo "service user: ${SVC_USER:-<empty; use the user from ps>}"
ps -eo user,cmd | grep 'standalone/server.js' | grep -v grep

stat -c '%U:%G %a %s %n' "$APP_ROOT/.next/standalone/.next/static/chunks/"*.css
CSS=$(ls "$APP_ROOT/.next/standalone/.next/static/chunks/"*.css | head -1)
namei -l "$CSS"
sudo -u "${SVC_USER:-www-data}" test -r "$CSS"; echo "readable_exit=$?"
```

`readable_exit=0` means that user can read the file. Any other value means the open fails. Directories above the file must be traversable (`755` is the usual mode) and the `.css` files themselves readable (`644`). `namei -l` shows the first ancestor that blocks the service user. Fix mode or group for that user and restart `<unit>`. Do not make `/var/lib/cdd/atlas.sqlite` writable by the web user; this check is only about the static chunks.

### b. Whether the served HTML's chunk hashes exist on disk

A build/restart ordering problem (restart before `prepare-standalone` finishes, or HTML from one build and files from another) leaves the homepage pointing at hashes that are not on disk.

```bash
curl -fsS https://center4digitaldemocracy.com/ -o /tmp/cdd-home.html
grep -oE '/_next/static/[^"'"'"' ]+' /tmp/cdd-home.html | sort -u > /tmp/cdd-assets.txt
while IFS= read -r p; do
  rel=${p%%\?*}
  f="$APP_ROOT/.next/standalone/.next${rel}"
  if [ -f "$f" ]; then
    echo "present $(stat -c '%s' "$f") $rel"
  else
    echo "MISSING $rel"
  fi
done < /tmp/cdd-assets.txt
```

Any `MISSING` line, in particular a `.css` path, is this failure. From `APP_ROOT`, run `npm run build` and restart `<unit>` only after it exits 0, then repeat this loop. `prepare-standalone` prints each copied file; a CSS chunk has to appear in that log.

### c. Whether nginx proxies `/_next/static` or serves it from disk

```bash
sudo nginx -T | grep -n _next
```

No `location /_next/static` block means those URLs are proxied to the standalone Node server, so a Node `EACCES` or `ENOENT` becomes the HTTP 500 the browser sees. Serve the hashed files from the standalone directory instead. `expires max` plus `Cache-Control: public, immutable` matches the content-hashed filenames. Both the `location` and the `alias` end in `/`.

```nginx
location /_next/static/ {
    alias /ABSOLUTE/APP_ROOT/.next/standalone/.next/static/;
    expires max;
    add_header Cache-Control "public, immutable";
    access_log off;
}
```

Replace `/ABSOLUTE/APP_ROOT` with `WorkingDirectory` from the unit (step a). `sudo nginx -t && sudo systemctl reload nginx`. The nginx user (usually `www-data`) must be able to read the files; reuse the `namei -l` and `sudo -u www-data test -r` commands from step a. Then `curl -sS -D - -o /dev/null "https://center4digitaldemocracy.com<path-to.css>"` and confirm HTTP 200.

### d. Journal around a request for the CSS path

```bash
CSS_PATH=$(grep -oE '/_next/static/chunks/[^"'"'"' ?]+\.css' /tmp/cdd-home.html | head -1)
echo "requesting $CSS_PATH"
curl -sS -D - -o /tmp/cdd.css.body "https://center4digitaldemocracy.com${CSS_PATH}" | head -n 20
wc -c /tmp/cdd.css.body
sudo journalctl -u <unit> --since "5 min ago" --no-pager
```

A 21-byte `/tmp/cdd.css.body` containing `Internal Server Error` is the outage response. In the journal, `EACCES` on that CSS path is step a. `ENOENT` is step b. To watch the request live, run `sudo journalctl -u <unit> -f` in one shell and the `curl` in another.

## On-demand production smoke

[`.github/workflows/smoke-production.yml`](../.github/workflows/smoke-production.yml) is `workflow_dispatch` only. It runs `npm run smoke -- https://center4digitaldemocracy.com`. It uses no secrets and does not SSH or deploy. Actions → **Production asset smoke** → **Run workflow**. A red run means the live homepage or a `/_next/static` asset it references is not HTTP 200.

CI (`.github/workflows/ci.yml`) runs the same smoke against a locally built standalone server on a free port after `npm run build`. That catches a bad copy before it is deployed. It does not request production.

## Local check

```bash
npm run build
npm start
npm run smoke -- http://localhost:3000
```

`npm start` listens on port 3000 unless `PORT` is set. Point smoke at that same origin.
