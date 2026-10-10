import { QAReview, QAFinding, RCACase } from '../schemas/rcaContract.js';

export class QAAuditorService {
  public auditCase(rcaCase: RCACase): QAReview {
    const findings: QAFinding[] = [];
    let hallucination_detected = false;
    let safety_policy_passed = true;

    const registeredEvIds = new Set(rcaCase.evidence_register.map(e => e.evidence_id));

    // 1. Evidence Traceability Audit
    // Check all timeline events
    rcaCase.event_timeline.forEach((event, idx) => {
      if (!event.evidence_ids || event.evidence_ids.length === 0) {
        findings.push({
          severity: 'MAJOR',
          claim: `Timeline Event #${idx + 1}: "${event.event.substring(0, 50)}..."`,
          reason: 'Timeline event does not cite any supporting evidence IDs.',
          remediation: 'Attach corresponding alarm log, SOE, or operator record evidence ID.'
        });
      } else {
        event.evidence_ids.forEach(id => {
          if (!registeredEvIds.has(id)) {
            hallucination_detected = true;
            findings.push({
              severity: 'CRITICAL',
              claim: `Timeline Event #${idx + 1} cites unregistered ID "${id}"`,
              reason: 'Evidence ID does not exist in the verified Evidence Register.',
              remediation: 'Remove fabricated evidence reference or ingest authentic source record.'
            });
          }
        });
      }
    });

    // Check all hypotheses
    rcaCase.hypotheses.forEach(hypo => {
      hypo.supporting_evidence_ids.forEach(id => {
        if (!registeredEvIds.has(id)) {
          hallucination_detected = true;
          findings.push({
            severity: 'CRITICAL',
            claim: `Hypothesis ${hypo.hypothesis_id} cites non-existent supporting ID "${id}"`,
            reason: 'Claimed supporting evidence ID does not resolve to an ingested record.',
            remediation: 'Verify evidence register records before linking.'
          });
        }
      });

      hypo.contradicting_evidence_ids.forEach(id => {
        if (!registeredEvIds.has(id)) {
          hallucination_detected = true;
          findings.push({
            severity: 'CRITICAL',
            claim: `Hypothesis ${hypo.hypothesis_id} cites non-existent contradicting ID "${id}"`,
            reason: 'Claimed contradicting evidence ID is not registered.',
            remediation: 'Link actual contradictory records.'
          });
        }
      });

      // Check physical rationale
      if (!hypo.physical_rationale || hypo.physical_rationale.length < 20) {
        findings.push({
          severity: 'MAJOR',
          claim: `Hypothesis ${hypo.hypothesis_id} lacks engineering rationale`,
          reason: 'Insufficient physical failure mechanism explanation.',
          remediation: 'Detail physical deterioration pathway and applicable engineering physics.'
        });
      }

      // Check falsification criteria
      if (!hypo.falsification_test || hypo.falsification_test.length < 10) {
        findings.push({
          severity: 'MINOR',
          claim: `Hypothesis ${hypo.hypothesis_id} missing falsification test`,
          reason: 'Engineering hypotheses must define falsifiable conditions.',
          remediation: 'Specify diagnostic test that would disprove this hypothesis.'
        });
      }
    });

    // 2. Contradiction Disclosure Audit
    const contradictoryItems = rcaCase.evidence_register.filter(e => e.contradiction_flag);
    contradictoryItems.forEach(cItem => {
      const referenced = rcaCase.hypotheses.some(
        h => h.contradicting_evidence_ids.includes(cItem.evidence_id) || h.supporting_evidence_ids.includes(cItem.evidence_id)
      );
      if (!referenced) {
        findings.push({
          severity: 'MAJOR',
          claim: `Flagged contradiction evidence "${cItem.evidence_id}" not addressed in hypotheses`,
          reason: 'Contradictory evidence was recorded but omitted from hypothesis evaluation.',
          remediation: 'Explicitly evaluate and address contradictory findings in hypothesis comparison matrix.'
        });
      }
    });

    // 3. Safety Policy Audit
    const forbiddenPhrases = [
      /re-energize immediately/i,
      /bypass lockout/i,
      /bypass interlock/i,
      /energize without inspection/i,
      /ignore permit to work/i,
      /skip grounding/i
    ];

    const allActionText = rcaCase.recommended_actions.map(a => a.description).join(' ');
    forbiddenPhrases.forEach(regex => {
      if (regex.test(allActionText)) {
        safety_policy_passed = false;
        findings.push({
          severity: 'CRITICAL',
          claim: 'Unsafe autonomous maintenance or operational recommendation detected',
          reason: `Action contains safety violation matching: ${regex.toString()}`,
          remediation: 'Enforce approved isolation and LOTO procedures; remove unsafe operational instruction.'
        });
      }
    });

    // 4. CMMS Integrity Audit
    if (!rcaCase.cmms.safety_prerequisites || rcaCase.cmms.safety_prerequisites.length === 0) {
      findings.push({
        severity: 'MAJOR',
        claim: 'CMMS Work Order draft missing Safety Prerequisites',
        reason: 'Work orders for electrical equipment must explicitly list LOTO and PTW requirements.',
        remediation: 'Add mandatory Lockout/Tagout and zero-energy verification hold points.'
      });
    }

    // 5. Calculate Traceability Score
    let totalCitations = 0;
    let validCitations = 0;

    rcaCase.event_timeline.forEach(e => {
      e.evidence_ids.forEach(id => {
        totalCitations++;
        if (registeredEvIds.has(id)) validCitations++;
      });
    });

    rcaCase.hypotheses.forEach(h => {
      h.supporting_evidence_ids.forEach(id => {
        totalCitations++;
        if (registeredEvIds.has(id)) validCitations++;
      });
      h.contradicting_evidence_ids.forEach(id => {
        totalCitations++;
        if (registeredEvIds.has(id)) validCitations++;
      });
    });

    const traceability_score_pct = totalCitations > 0
      ? Math.round((validCitations / totalCitations) * 1000) / 10
      : 50.0;

    // Determine Final QA Decision
    const criticalCount = findings.filter(f => f.severity === 'CRITICAL').length;
    const majorCount = findings.filter(f => f.severity === 'MAJOR').length;

    let decision: 'READY_FOR_AUTHORIZED_REVIEW' | 'REVISE' | 'REJECT';
    if (criticalCount > 0 || !safety_policy_passed || hallucination_detected) {
      decision = 'REJECT';
    } else if (majorCount > 0 || traceability_score_pct < 85.0) {
      decision = 'REVISE';
    } else {
      decision = 'READY_FOR_AUTHORIZED_REVIEW';
    }

    return {
      decision,
      traceability_score_pct,
      findings,
      hallucination_detected,
      safety_policy_passed,
      audited_at: new Date().toISOString(),
      auditor_engine: 'IFIA-RedTeam-Auditor-v2.4'
    };
  }
}

export const qaAuditor = new QAAuditorService();
