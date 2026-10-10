# IFIA Architecture Inventory

**Purpose:** preserve the component inventory from the supplied implementation report while distinguishing reported design from repository-verified implementation.

## Reported workflow

1. **Evidence and contract layer** — validate structured case evidence and constrain material claims to registered evidence IDs.
2. **Reasoning layer** — use a server-side Claude client and reported deterministic fallback/domain logic.
3. **Independent QA layer** — evaluate traceability, contradictions, unsupported evidence identifiers, and safety policy violations.
4. **Human authorization layer** — require an authorized engineering reviewer before operationally significant dispatch.
5. **CMMS sandbox layer** — draft Maximo/SAP PM work orders, enforce prerequisites and hold points, and suppress duplicate submissions.
6. **Reporting layer** — provide benchmark/ROI views, a portfolio case study, and a printable RCA report.

## Reported source-path map

```text
server/
  schemas/rcaContract.ts
  services/claudeClient.ts
  services/qaAuditor.ts
  services/cmmsAdapter.ts
  data/syntheticCases.ts
client/
  src/components/ApprovalGovernanceModal.tsx
  src/components/BenchmarkDashboard.tsx
  src/components/PortfolioCaseStudy.tsx
  src/components/RCAReportPrintView.tsx
```

This is a path map transcribed from the report, **not a confirmed repository tree**. These application files have not been committed because their actual contents were not available for review.

## Important implementation questions for source review

- How are evidence records ingested, versioned, and bound to each RCA claim?
- Are model outputs parsed against strict schemas and rejected on validation failure?
- Is prompt-injection handling tested against indirect instructions in source documents?
- Are QA decisions independent of the primary reasoning response?
- Are approval roles authenticated and authorized server-side rather than trusted from client input?
- Is the audit trail append-only and cryptographically verifiable?
- Is CMMS dispatch restricted to a sandbox by default, with explicit configuration gates for any external endpoint?
- Are idempotency keys persisted atomically to prevent race-condition duplicates?
- Are secrets kept outside source control and redacted from logs?
- Are benchmark inputs, definitions, raw outputs, and calculation methods versioned and reproducible?

Answers require source code, configuration, and test artifacts; they are not inferred here.
