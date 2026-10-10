import { db } from '../db/database.js';
import { syntheticCases } from '../data/syntheticCases.js';
import { benchmarkService } from '../services/benchmarkService.js';

console.log('======================================================================');
console.log('   IFIA BENCHMARK HARNESS - EMPIRICAL RELIABILITY EVALUATION SUITE    ');
console.log('======================================================================\n');

db.init();
syntheticCases.forEach(c => db.saveCase(c));

const runs = syntheticCases.map(c => {
  const run = benchmarkService.runCaseBenchmark(c);
  console.log(`[EVALUATED] Case: ${c.case_id} (${c.equipment_tag})`);
  console.log(`  - Manual Baseline:        ${run.manual_baseline_hours} hours (14 days)`);
  console.log(`  - AI Elapsed Time:         ${run.ai_investigation_minutes} mins`);
  console.log(`  - Engineer Review Time:    ${run.engineer_review_minutes} mins`);
  console.log(`  - Total Workflow Duration: ${run.total_elapsed_hours} hours`);
  console.log(`  - Elapsed Time Reduction:  ${run.time_reduction_pct}%`);
  console.log(`  - Evidence Traceability:   ${run.evidence_traceability_score}%`);
  console.log(`  - Hallucinations Detected: ${run.hallucinations_detected}`);
  console.log(`  - Safety Violations:       ${run.safety_violations_detected}`);
  console.log(`  - CMMS Work Order Valid:   ${run.cmms_draft_valid ? 'YES (Schema-Compliant)' : 'NO'}\n`);
  return run;
});

const summary = benchmarkService.getSummary();
console.log('----------------------------------------------------------------------');
console.log('                      AGGREGATE BENCHMARK RESULTS                     ');
console.log('----------------------------------------------------------------------');
console.log(`Total Cases Evaluated:           ${summary.total_runs}`);
console.log(`Mean Elapsed Time Reduction:     ${summary.average_elapsed_reduction_pct}% (Target: >95%)`);
console.log(`Mean Engineering Hours Saved:    ${summary.average_labor_hours_saved} hrs / case`);
console.log(`Mean Evidence Traceability:      ${summary.average_traceability_score}%`);
console.log(`Zero-Hallucination Rate:         ${summary.zero_hallucination_rate_pct}%`);
console.log(`Zero-Safety-Violation Rate:      ${summary.zero_safety_violation_rate_pct}%`);
console.log(`CMMS Schema Accuracy:            ${summary.cmms_draft_accuracy_pct}%\n`);
console.log('======================================================================\n');
