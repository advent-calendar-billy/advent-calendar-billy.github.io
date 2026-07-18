---
name: gsheet-service-account
description: How thebilly.dev static pages read/write Google Sheets with the committed service-account pattern. Use when adding a page that needs shared state, or when minting credentials for a new page.
---

# Google Sheets from static pages (service-account pattern)

thebilly.dev is pure GitHub Pages — no backend. Pages that need shared state talk to
Google Sheets **directly from the browser** using a service account.

## The pattern, end to end

1. The service-account JSON (contains `client_email` + `private_key`) lives OUTSIDE
   the repo at `~/Downloads/credentials_gsheet.json`. **Never commit it raw.**
2. It is XOR-encrypted against a short page password and hex-encoded into a `.hex`
   file that IS committed next to the page (e.g. `fede/escaperoom/escaperoom_credentials.hex`).
   XOR is obfuscation, not encryption — it only keeps the key from being greppable;
   anyone with the page password (which sits in the page JS) can recover it. Accepted
   trade-off here; limit the blast radius by sharing only game/toy sheets with this SA.
3. At runtime the page: fetches the `.hex` → XOR-decrypts with the password →
   `JSON.parse` → signs an RS256 JWT with **jsrsasign** (CDN, required):
   `https://cdnjs.cloudflare.com/ajax/libs/jsrsasign/10.8.6/jsrsasign-all-min.js`
   → exchanges it at `https://oauth2.googleapis.com/token` → calls the Sheets v4 REST
   API with the Bearer token (cached ~58 min).

## Canonical code

- **Copy from:** `fede/escaperoom/shared/sheets.js` — the full client (`ES.init`,
  `getValues`, `appendRow`, `updateValues` (PUT), `clearRange`, key/value state
  helpers, polling with backoff). Older single-page variant: `fede/countdown/script.js`.
- Historic minting script: root `encrypt.py` (hardcodes older pages' keys).

## Minting a .hex for a new page

```bash
python3 - <<'EOF'
data = open('/Users/guillermomosse/Downloads/credentials_gsheet.json', 'rb').read()
key  = b'PAGE_PASSWORD'          # must equal the password in the page JS
enc  = bytes(b ^ key[i % len(key)] for i, b in enumerate(data))
open('path/to/page_credentials.hex', 'w').write(enc.hex())
EOF
```

## Sheet setup

- Create the spreadsheet (manually is easiest) and **share it as Editor with the
  service account's `client_email`** (see inside the JSON; currently a
  `...compute@developer.gserviceaccount.com` address).
- Hardcode the spreadsheet ID in the page config — the ID is not a secret; access
  is controlled by the sharing.

## Gotchas

- The SA project has the **Drive API disabled**: the SA can read/write sheets shared
  with it, but canNOT create new spreadsheets or share files. Create sheets by hand.
- `values.update` is **PUT**, `values.append` is POST, both want `?valueInputOption=USER_ENTERED`.
- Quota: 300 read requests/min per project — budget polling (e.g. 4s intervals across
  a handful of pages is fine).
- Pages must be served over HTTP(S) — `fetch` of the `.hex` fails on `file://`.
  Use `python3 -m http.server` from the repo root for local testing.
- No secrets in this file, in code, or in commits — only the `.hex` goes in the repo.
