# LEVELUP backend

The site is served by `level.js`, a Node.js backend with a local SQLite database. It requires Node.js 22.13 or later and has no npm dependencies.

## Run locally

1. Copy `.env.example` to `.env` and fill in the merchant settings you have received. Leave unconfigured providers blank.
2. Run `node level.js` from this folder.
3. Open `http://localhost:3000`.

The server creates `levelup.sqlite` automatically. Passwords use salted PBKDF2 hashes. Sessions are random, hashed in the database, and sent to the browser only as `HttpOnly; SameSite=Strict` cookies (`Secure` in production). Login, registration, order creation, checkout, and chat have in-process IP rate limits; the application checks request origins and sets a Content Security Policy. These limits reset on restart and are per process; use a shared limiter such as Redis if running multiple app instances. The local server binds to `127.0.0.1` by default. Production needs an HTTPS reverse proxy, backups, and secrets managed by the host. Set `NODE_ENV=production`, `HOST=0.0.0.0`, and `PUBLIC_BASE_URL=https://your-real-domain` behind that proxy. If rate limiting needs client IPs through a proxy, set `TRUSTED_PROXY_IP` to that proxy's address.

## Current API

- `GET /api/health` reports which integrations have configuration.
- `GET /api/games` returns the server-side game and package catalog.
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` manage accounts and sessions.
- `POST /api/orders` creates a `pending_payment` order only for a signed-in user and a configured Payme/Click method. It never reports a top-up as successful at order creation.
- `POST /api/payments/checkout` returns a Payme or Click hosted checkout URL only to the order owner and only when that provider is configured.
- `POST /api/payments/payme` implements Payme Merchant API transaction callbacks.
- `POST /api/payments/click` handles Click Shop API prepare/complete callbacks with signature checking and form-encoded callback bodies.
- `GET /api/profile` returns the authenticated user's orders and card metadata.
- `POST /api/cards` is intentionally disabled until a PCI-compliant tokenization provider is integrated. The server does not accept or store card data.
- `POST /api/ai-chat` provides a support FAQ simulation.

## What is needed for live sales

Register the business with Payme/Click, receive merchant credentials, set public HTTPS callback URLs in each merchant cabinet, and put the credentials in `.env` (or the production secret store). Uzum Bank requires its own partner onboarding and its documented check/create/confirm/status webhook integration; that adapter is not implemented or enabled here. Card storage needs a PCI-compliant processor that returns a token; this project does not handle full card numbers or CVV.

To deliver game currency, obtain an authorized distributor/provider API account and configure `GAME_PROVIDER_URL` and `GAME_PROVIDER_API_KEY`. The URL must use HTTPS. A durable SQLite queue retries delivery failures with exponential backoff (up to eight attempts), sends `Idempotency-Key: <order id>`, and expects `{"success":true,"reference":"..."}`. Adapt the request/response in `fulfilOne()` to the actual distributor's documented API before enabling it. Without that integration, paid orders remain `paid` for manual fulfillment; the app does not claim that UC/Diamonds were delivered. The distributor must honor the idempotency key to prevent duplicate top-ups after network failures.

Prices and package amounts in `level.js` are demo catalog data and must be replaced with the actual supplier's current prices before accepting live orders. The Tailwind CDN is convenient for development; production should build and serve pinned CSS locally.
