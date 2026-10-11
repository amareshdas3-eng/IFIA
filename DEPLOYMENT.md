# IFIA deployment guide

## Recommended ProEngineering URL

Deploy the Node.js service as a separate application at `https://ifia.proengineering.in` and keep the existing WordPress site at `https://proengineering.in`. Do not replace the WordPress website with the Node.js app.

## Release state and safety boundary

- This is a staging-first deployment. Keep `CMMS_MODE=SANDBOX`.
- `POST /api/auth/token` intentionally returns 404 in production because the current demo-persona mechanism is not a verified identity provider.
- Do not enable production engineer approvals or CMMS dispatch until an authenticated identity provider and auditable user provisioning are implemented.
- The application currently persists data in local JSON files. Use one instance only and configure backups; do not scale horizontally without moving state to a transactional database and coordinating audit writes.
- A healthy `/api/health` response is not a security certification.

## Build and test locally

Requires Node.js 22 and npm.

```bash
npm ci
npm run build:server
npm run build:server:emit
npm run build:client
npm test
npm run benchmark
```

## Docker staging

Generate a cryptographically random secret in the deployment environment. Never commit it to Git.

```bash
export AUTH_SECRET="$(openssl rand -hex 32)"
export ALLOWED_ORIGINS="https://ifia.proengineering.in"
docker compose -f compose.yaml config
docker compose -f compose.yaml up --build -d
docker compose -f compose.yaml ps
docker compose -f compose.yaml logs --tail=100 ifia
curl --fail http://127.0.0.1:3001/api/health
```

The container binds to loopback only. Put it behind a managed HTTPS reverse proxy or platform ingress. Do not expose port 3001 directly to the internet.

## Hostinger managed Node.js web app

1. In hPanel, check whether the account offers **Websites → Add website → Node.js Web App**. Availability depends on the hosting plan; do not remove or replace the existing WordPress site to make room.
2. Create a separate Node.js app using this repository and the reviewed deployment branch.
3. Set the build command to `npm ci && npm run build:server:emit && npm run build:client`.
4. Set the start command to `npm start`.
5. Configure environment variables in hPanel: `NODE_ENV=production`, `PORT` (the port assigned by the platform), `AUTH_SECRET` (random 64-character hex value), `ALLOWED_ORIGINS=https://ifia.proengineering.in`, `CMMS_MODE=SANDBOX`, `REQUIRE_HUMAN_APPROVAL_FOR_CMMS=true`, `ENABLE_PROMPT_INJECTION_SHIELD=true`, and a persistent `STORAGE_DIR` only if the platform provides persistent writable storage.
6. Add the subdomain in the hosting panel and follow its DNS/SSL instructions. Keep the current WordPress domain and files intact.
7. Verify the deployment logs and `/api/health`, then test the dashboard, authorization failure paths, data persistence after restart, and backup restoration.

## Render free-tier demo (no DNS changes)

Use this path only when Hostinger does not offer a Node.js app. The repository includes `render.yaml` for a temporary demo service on Render's free web-service tier.

1. Open the Render dashboard and choose **New → Blueprint** (or use Render's Blueprint creation flow).
2. Connect `amareshdas3-eng/IFIA`, select branch `ifia/source-import-initial`, and review the Blueprint from `render.yaml`.
3. Confirm the service is named `ifia-proengineering-demo` and the plan is **Free**. The Blueprint creates only one web service; it does not add a database, change DNS, or modify Hostinger/WordPress.
4. When prompted for `ALLOWED_ORIGINS`, enter the exact HTTPS origin Render assigns to this service (for example, `https://ifia-proengineering-demo.onrender.com` only if that is the actual URL shown in your dashboard). Do not include a trailing slash or guess the final hostname.
5. Let Render generate `AUTH_SECRET`. Do not add an Anthropic API key or real industrial credentials for this initial demo.
6. Review the cost/plan screen carefully. If the dashboard requires a paid plan, payment method, or upgrade to proceed, stop and do not approve it.
7. Deploy, then open the assigned HTTPS URL and check `/api/health`. Verify the UI and confirm `POST /api/auth/token` returns `DEMO_TOKEN_ISSUANCE_DISABLED` in production.
8. Keep the demo for synthetic sample data only. The configured `STORAGE_DIR=/tmp/ifia-data` is intentionally ephemeral; cases, audit records, and benchmark history may be lost after restarts, spin-downs, or redeploys. Do not use it for real records or rely on it for audit retention.

The free service can spin down after inactivity and may take about a minute to wake. It is for preview/testing, not production operations. Keep the ProEngineering root domain and all existing DNS records unchanged. Do not add `ifia.proengineering.in` until the temporary service is verified and you explicitly approve a subdomain-only DNS change.

## Known production gates before public operational use

- Replace demo identity selection with OIDC or another real identity provider; map identities to server-controlled roles and enforce provisioning/deprovisioning.
- Add rate limiting, request-size limits per route, and abuse controls for investigation endpoints.
- Move JSON file storage to a durable transactional database with tested backups and migration/restore procedures.
- Store audit records in append-only or externally anchored storage; a local hash chain alone cannot detect all deletion or whole-file replacement scenarios.
- Complete external security review and operational safety validation before connecting any live CMMS or plant system.
