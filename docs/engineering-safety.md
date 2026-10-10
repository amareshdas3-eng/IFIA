# IFIA Engineering Safety and Deployment Guardrails

IFIA concerns industrial electrical failure investigation and CMMS work-order drafting. A language model output must not be treated as an engineering authorization.

## Required operating principles

- Use synthetic or approved, sanitized data for development and demonstrations.
- Keep CMMS integration in sandbox/dry-run mode by default.
- Require authenticated, role-authorized human approval before any external work-order creation or operational action.
- Preserve source evidence, provenance, timestamps, equipment identifiers, and uncertainty.
- Reject unsupported evidence references, contradictory evidence that remains unresolved, and recommendations that violate configured safety policy.
- Require applicable site procedures, permit-to-work (PTW), lockout/tagout (LOTO), and safety hold points to be verified by qualified personnel.
- Log approval, revisions, dispatch requests, responses, and duplicate suppression without logging secrets.
- Never put API keys or CMMS credentials in committed files; use a local ignored environment file or a managed secret store.

## Technical recommendations in the report

The supplied report contains example work-order parameters, including GIS evacuation/vacuum conditions, torque values, and cable VLF test voltage/duration. These are **reported example values, not approved instructions**. Do not apply them to real equipment unless the exact equipment, OEM documentation, applicable standards/edition, site procedures, test method, and authorized engineering review confirm them.

## Before any live integration

1. Confirm that the target CMMS endpoint and credentials are approved for the intended environment.
2. Demonstrate that no dispatch can occur without server-side authorization.
3. Verify idempotency under retries and concurrent requests.
4. Test safe behavior for malformed, incomplete, conflicting, and prompt-injected evidence.
5. Verify audit-log integrity and access controls.
6. Have the site electrical authority and safety team approve the operating procedure.
7. Start with read-only or draft-only permissions and a controlled pilot.

This document is a guardrail checklist, not a certification that the reported application satisfies it.
