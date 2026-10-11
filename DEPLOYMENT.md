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

## Known production gates before public operational use

- Replace demo identity selection with OIDC or another real identity provider; map identities to server-controlled roles and enforce provisioning/deprovisioning.
- Add rate limiting, request-size limits per route, and abuse controls for investigation endpoints.
- Move JSON file storage to a durable transactional database with tested backups and migration/restore procedures.
- Store audit records in append-only or externally anchored storage; a local hash chain alone cannot detect all deletion or whole-file replacement scenarios.
- Complete external security review and operational safety validation before connecting any live CMMS or plant system.
