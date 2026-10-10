# IFIA Source Import and Security Audit — Initial Pass

**Audit type:** static inspection of the supplied `RCA AGENT.zip` archive and attempted local test execution.  
**GitHub code-import status:** the archive was inspected, but its application files have not yet been transferred into this repository.  
**Scope limit:** this is an initial review, not a complete security certification or production-readiness approval.

## Archive inventory

The ZIP contains 12,116 entries, including approximately 49 non-dependency, non-built-output project files. The source includes:

- React + TypeScript client components for intake, evidence exploration, timeline, fault tree, hypotheses, QA review, approvals, CMMS draft, benchmark dashboard, and printable RCA report.
- Express/TypeScript API routes and services for cases, approvals, CMMS, audit, benchmark, Claude API integration, RCA reasoning, and QA auditing.
- Zod contract schemas, five synthetic industrial failure cases, four test files, package manifest and lockfile.
- A `.env` file, `node_modules`, built client output, and mutable JSON data-store files.

## Import hygiene decisions

Do **not** commit the ZIP's `.env`, `node_modules/`, or generated `client/dist/`. The `.env` inspected in this archive did not contain a non-empty Anthropic API key, but the file should still remain excluded from version control. Use `.env.example` as the tracked template.

The archive contains mutable `data_store/` files with seeded case states and audit/benchmark records. Keep these out of the source import until their purpose, provenance, and suitability for publication are confirmed. The source includes synthetic case fixtures in `server/data/syntheticCases.ts`, which are the appropriate place to preserve demonstration cases.

The archive does not contain a `.gitignore` or `tsconfig.server.json`, although the package manifest has a `build:server` script that references `tsconfig.server.json`.

## High-priority findings

### IFIA-SEC-001 — Approval endpoint trusts caller-supplied identity and role

**Evidence:** `server/routes/approvals.ts` accepts `reviewer_name`, `reviewer_role`, and `decision` directly from `req.body`. It defaults the role to `LEAD_ELECTRICAL_ENGINEER` and sets `case_status = 'APPROVED'` when the request says `ACCEPTED`. No authentication or server-side role authorization is visible in the route.

**Impact:** an unauthenticated caller able to reach the API can forge an engineering approval. The human-in-the-loop gate is therefore not a trustworthy authorization boundary.

**Required remediation:** authenticate users; derive identity and roles from verified server-side session/token claims; enforce a server-side allowlist/authorization policy for each approval action; validate the entire payload against a schema; audit the authenticated principal; add negative tests for anonymous and unauthorized callers.

### IFIA-SEC-002 — CMMS dispatch endpoint trusts a caller-supplied role/name

**Evidence:** `server/routes/cmms.ts` reads `user_role` and `user_name` from the request body and defaults the role to `LEAD_ELECTRICAL_ENGINEER`. The adapter checks case approval status, but that status can be set by the unauthenticated approval route described above.

**Impact:** the approval check can be bypassed by forging approval through the API. The caller identity in the audit record is not trustworthy.

**Required remediation:** block external dispatch until authentication and authorization are implemented; require a verifiable approval record bound to an authenticated reviewer and case revision; add integration tests for approval forgery, role escalation, stale approvals, and concurrent dispatch attempts.

### IFIA-SEC-003 — API routes are exposed without visible authentication; CORS is permissive

**Evidence:** `server/index.ts` calls `app.use(cors())` and mounts case, approval, CMMS, benchmark, and audit routes without visible authentication middleware. Case routes include create, seed/reset, and delete operations.

**Impact:** if deployed on a reachable network, a caller may read case/audit data and mutate case state, submit forged approvals, or trigger dispatch logic. CORS alone is not authentication and should not be treated as access control.

**Required remediation:** do not expose this server to an untrusted network in its current form. Add authentication/authorization, restrictive CORS allowlists, rate limiting, request validation, security headers, and deployment network controls before any hosted deployment.

### IFIA-SEC-004 — CMMS adapter reports dispatch success without a demonstrated external connector

**Evidence:** `server/services/cmmsAdapter.ts` waits for a configured latency, creates a synthetic `CMMS-...` reference, updates local case state, and returns `SUBMITTED_TO_CMMS`. The reviewed implementation does not show an HTTP/API client for Maximo or SAP PM.

**Impact:** configuration names such as `MAXIMO_REST` or `SAP_PM_REST` may imply real dispatch while the code shown only simulates a local submission. This can mislead operators and benchmark reviewers.

**Required remediation:** label the current behavior explicitly as simulation; fail closed when a non-sandbox mode is selected but no verified connector is configured; implement each external connector separately with credential management, response validation, timeouts, retries, and end-to-end tests.

### IFIA-SEC-005 — Audit integrity field is Base64 encoding, not a cryptographic integrity hash

**Evidence:** `server/db/database.ts` sets `integrity_hash` using `Buffer.from(...).toString('base64')`.

**Impact:** Base64 is reversible encoding and provides no tamper detection. The audit trail is not immutable merely because this field exists.

**Required remediation:** use a cryptographic digest such as SHA-256 over a canonical record representation; chain records or sign them with a protected key if tamper evidence is required; protect storage with access controls; add tests that mutate records and verify integrity failure.

### IFIA-SEC-006 — Prompt-injection filtering is narrow and does not cover every evidence field

**Evidence:** `server/services/claudeClient.ts` applies regex filtering to equipment tag/class, symptoms, and impact, then serializes `evidence_register` directly into the prompt. The filters cover a small set of literal patterns.

**Impact:** malicious instructions embedded in evidence titles or raw content may reach the model unfiltered. Regex replacement alone is not a reliable prompt-injection security boundary.

**Required remediation:** treat all ingested evidence as untrusted data; delimit/structure evidence separately from system policy; validate and sanitize every field consistently; use adversarial test cases including indirect and obfuscated injection; ensure model output is schema-validated and policy-checked before it affects case state or work orders.

## Build and test observations

### Test command in package manifest

The archive's `package.json` defines `npm test` as:

```sh
node --loader tsx --test server/tests/*.test.ts
```

On the audit runtime (Node.js v22.16.0), this failed before test execution because the installed `tsx` instructs Node to use `--import` rather than the deprecated `--loader` option.

### Follow-up execution attempt

Running the test files with `node --import tsx --test server/tests/*.test.ts` also failed before executing assertions because the archived `node_modules` contains the Windows x64 esbuild binary, while the audit runtime is Linux x64. This is consistent with copying `node_modules` across operating systems.

**Result:** the nine tests reported by the implementation report have **not** been independently reproduced in this environment. Reinstall dependencies from the lockfile on the target platform and update the test script to the supported tsx invocation before rerunning.

### Additional reproducibility gaps

- `build:server` references missing `tsconfig.server.json`.
- The archive includes prebuilt `client/dist/`; this output should not substitute for a reproducible client build.
- No `.gitignore` is present.
- A clean dependency installation and dependency vulnerability review remain outstanding.
- The audit did not connect to Anthropic, a real CMMS, or any operational plant systems.

## Import recommendation

Import the reviewed source under `ifia/app/` only after excluding `.env`, `node_modules/`, `client/dist/`, and the mutable `data_store/` files. Preserve the original source for traceability; address critical authorization issues in a separately reviewed change rather than silently modifying the imported baseline.

## Audit disposition

**Status: HOLD for deployment.** The current implementation may be useful as a local synthetic demonstration, but the unauthenticated approval and dispatch controls, misleading external-CMMS success behavior, and non-cryptographic audit encoding must be addressed before any production or plant-connected use.
