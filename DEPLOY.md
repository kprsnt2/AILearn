# Deploying AILearn

The site is pure static HTML/CSS/JS. There is no build step. Three hostings are supported.

---

## 1 · GitHub Pages (primary) — `learn.kprsnt.in`

**Status: deployed, waiting on one DNS record.**

What is already configured in this repo:

| File | Purpose |
|---|---|
| `.nojekyll` | **Critical.** Disables Jekyll so files beginning with `_` (`_shell.css`, `_shell.js`, `_sync.js`) are served. Without it the whole site renders unstyled. |
| `CNAME` | `learn.kprsnt.in` |
| Pages source | branch `main`, path `/` (set via the API) |

### The one step only you can do: add the DNS record

In **Cloudflare → kprsnt.in → DNS**, add:

| Type | Name | Target | Proxy |
|---|---|---|---|
| `CNAME` | `learn` | `kprsnt2.github.io` | **DNS only** (grey cloud) |

Use *DNS only* on the first pass. GitHub has to see the CNAME to issue the TLS certificate;
Cloudflare's orange-cloud proxy can prevent that. Once GitHub shows "Certificate: approved"
(usually within an hour), you may switch the proxy on if you want Cloudflare in front.

Then in **GitHub → repo Settings → Pages**, confirm the custom domain and tick
**Enforce HTTPS**.

**Fallback URL** (works immediately, no DNS): <https://kprsnt2.github.io/AILearn/>

### Why not a GitHub Actions workflow?

None is needed. The repo *is* the artifact, so a workflow would only add a failure mode.

---

## 2 · Vercel (mirror)

Because `learn.kprsnt.in` is a CNAME to GitHub, a Vercel project with that same custom domain
would conflict. Use a different hostname for the mirror:

1. **vercel.com → Add New → Project → Import** `kprsnt2/AILearn`
2. Framework preset: **Other**. Build command: *(empty)*. Output directory: *(empty — root)*
3. Add domain `aillearn.vercel.app`, or a custom `ail.learn.kprsnt.in`

`vercel.json` is already present and pins the static behaviour.

---

## 3 · Local

Just open `index.html`. Everything works from `file://` except cross-device sync (needs HTTPS
origins) — see below.

---

## Cross-device sync — one manual step

The sync endpoint is deployed at `https://kprsnt.in/api/ailearn/sync` and currently returns
`503 sync not configured`. That is the designed no-op: the course works fully offline without it.

It needs a Vercel KV store (Upstash Redis under the hood). Free tier is ~256 MB; a learner's
whole progress document is a few kilobytes, so this is effectively unlimited for personal use.

### Steps (you, ~3 minutes)

1. **vercel.com → the `kprsnt.in` project → Storage → Create Database → Upstash for Redis** (KV)
2. Name it anything, choose the free plan, region as close as possible
3. Click **Connect to Project** → select the `kprsnt.in` project
4. Redeploy (Vercel does this automatically when env vars change)

That injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` into the project. The service reads either
those names or the `UPSTASH_REDIS_REST_*` equivalents, so a standalone Upstash database works too.

### Verify

```bash
curl -s "https://kprsnt.in/api/ailearn/sync?code=$(python -c 'print("a"*22+"-"+"b"*8)')"
# before KV: {"error":"sync not configured","ok":false}   HTTP 503
# after  KV: {"doc":null,"ok":true}                        HTTP 404
```

### Using it in the course

Open `tools/sync.html` → **Generate a sync code** → copy it → on your phone, open the same page,
paste the code, **Use this code → Pull**. Progress merges per-record and never deletes anything.

### Security model

- The code is `<22-char id>-<8-char password>`. The id addresses the record; the password is
  verified **server-side** on every write (only its SHA-256 is stored).
- The stored document is whitelisted (`lessons`, `flashcards`, `calibration`, `counters`) and
  capped at 96 KiB, so the endpoint cannot be used as general-purpose file storage.
- Records expire after ~13 months of inactivity.
- No accounts, no cookies, no PII. Losing the code loses write access to that record, not your
  local progress.
- If you want sync to work from a different host, add its origin to `_Ailearn_SYNC_ORIGINS` in
  `kprsnt.in/api/index.py`.

---

## Maintenance after deploy

```bash
python _validate.py            # links, sections, hooks, orphans, page weight
python _validate.py --verbose  # every problem listed
python _build_tracks.py        # regenerate track-*/index.html after editing lesson lists
node _browsertest.js           # 120-page headless Chrome sweep (needs Chrome on :9222)
```

`_validate.py` exits non-zero on hard errors, so it can gate a commit. Both `node` scripts are
development-only and are harmless in the deployed site, but nothing links to them.
