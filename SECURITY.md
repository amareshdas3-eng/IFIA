# Security Policy

## Scope and Security Architecture
The **Industrial Failure Intelligence Agent (IFIA)** is an engineering-grade Root Cause Analysis (RCA) and decision-support system designed for mission-critical industrial electrical infrastructure.

### Operational Boundaries & Safety Gates
1. **CMMS Sandbox Isolation**: By default, CMMS dispatch operations operate strictly in `SANDBOX` mode. No live plant control, SCADA, or production ERP/CMMS modifications are executed.
2. **Mandatory Human-in-the-Loop Gate**: Automated root-cause recommendations cannot be dispatched to maintenance management systems without explicit review and approval by an authorized Lead Electrical Engineer (`REQUIRE_HUMAN_APPROVAL_FOR_CMMS=true`).
3. **Evidence Contract Verification**: All diagnostic statements require explicit reference to verified sensor telemetry, relay oscillography, DGA chromatography, or acoustic partial discharge records (`EvidenceRecordSchema`). Hallucinated evidence IDs trigger immediate QA audit rejection.
4. **Prompt Injection Defense**: Ingested field notes and operator comments pass through defensive sanitization boundaries (`ENABLE_PROMPT_INJECTION_SHIELD=true`) to neutralize instruction-override and jailbreak attacks.
5. **Cryptographic Audit Trail**: All case mutations, approval decisions, and dispatch events generate tamper-evident audit log records with SHA-256 cryptographic digests.

### Reporting a Vulnerability
If you discover a security vulnerability within IFIA:
- Do not create a public GitHub issue.
- Please report vulnerabilities directly to the maintainer or security team.
- Security updates will be reviewed, patched, and validated against the automated security regression test suite (`server/tests/adversarialSecurity.test.ts`).
