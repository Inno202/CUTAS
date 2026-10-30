# CUTAS web app (React + TypeScript + Vite)

The portal for the CUT Academic Society: public pages, scholar workspace (study details,
publications, research challenges, growth plan, awards, profile) and the unified administrator
console. All data comes from the CUTAS API (Django + PostgreSQL), which lives in its own folder
(`cutas_backend`) - this folder contains **no back-end code and no secrets**.

## Run it locally

Requirements: Node.js 22 (or 20.19+), and the CUTAS API running on <http://127.0.0.1:8000>
(see `cutas_backend/README.md`).

```powershell
npm install
npm run dev        # http://localhost:3000
```

`npm run dev` forwards every `/api` request to the API (change the target with `DEV_API_PROXY` in
`.env.local`), so the browser sees one site and the secure session cookie just works.

| Command | What it does |
|---|---|
| `npm run dev` | development server with hot reload |
| `npm run lint` | TypeScript type check (strict) |
| `npm run build` | type check + production build into `dist/` |
| `npm run preview` | serve the production build locally (also forwards `/api`) |

## Deploy

**With Docker (recommended):** nothing to do here - `cutas_backend/deploy/docker-compose.yml` builds
this folder with the included `Dockerfile` and serves it with nginx, which also forwards `/api` to the
API. The nginx configuration (`deploy/nginx/`) adds the security headers (Content-Security-Policy,
HSTS behind HTTPS, frame blocking ...), long-term caching for fingerprinted files, gzip and flood
protection.

**Any other static host:** run `npm run build` and publish `dist/`. The host must
1. send every unknown path to `index.html` (single-page app routing), and
2. forward `/api/` to the CUTAS API on the same domain (recommended), **or** build with
   `VITE_API_BASE_URL=https://api.example.ac.za/api/v1` and list this site in the API's
   `CORS_ALLOWED_ORIGINS` (then `AUTH_COOKIE_SAMESITE=None` is required if the two are on different sites).

## How it is built

```
src/
  api/client.ts       fetch wrapper: access token in memory only, silent refresh through the
                      HttpOnly cookie, one retry on 401, snake_case <-> camelCase
  api/endpoints.ts    one function per API endpoint
  context/            AuthContext (sign-in, two-factor step, sign-out, session restore)
  router.ts           URL routes (/scholars, /admin#reports ...), safe ?next= redirects
  pages/              one file per page; pages/admin/ = administrator console sections
  components/         header (mobile drawer), footer, form controls, dialogs
```

* **Security:** no tokens in `localStorage`/`sessionStorage` (only an "a session may exist" hint);
  pages for signed-in users and the admin console are guarded in the app *and* enforced by the API;
  a strict Content-Security-Policy is injected into the production `index.html`; fonts are
  self-hosted (no third-party requests); source maps are not published.
* **Responsive:** checked at 320, 375, 414, 768, 1024, 1280 and 1920 px wide with no horizontal
  scrolling; tables become cards on phones, dialogs become bottom sheets, inputs use 16 px text so
  iOS does not zoom, and reduced-motion preferences are respected.
* **Performance:** pages are code-split and loaded on demand; images are WebP; the main bundle is
  about 90 KB gzipped.
