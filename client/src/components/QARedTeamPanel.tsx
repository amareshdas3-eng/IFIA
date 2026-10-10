import React from 'react';
import { QAReview } from '../types';
import { ShieldAlert, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Activity } from 'lucide-react';

interface QARedTeamPanelProps {
  qaReview?: QAReview;
  onRerunQA?: () => void;
}

export const QARedTeamPanel: React.FC<QARedTeamPanelProps> = ({ qaReview, onRerunQA }) => {
  if (!qaReview) {
    return (
      <div className="card-panel p-8 text-center text-xs text-slate-500">
        No QA audit record found for this case. Run analysis to trigger Prompt 6 Red-Team Review.
      </div>
    );
  }

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'READY_FOR_AUTHORIZED_REVIEW':
        return (
          <div className="p-4 rounded-xl bg-emerald-950/70 border-2 border-emerald-500 flex items-center gap-3">
            <CheckCircle2 size={24} className="text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 block">
                AUDIT VERDICT: PASSED
              </span>
              <h3 className="text-sm font-bold text-white">
                READY FOR AUTHORIZED ENGINEERING REVIEW
              </h3>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                All claims strictly traceable to ingested evidence. No hallucinated citations or safety bypasses detected.
              </p>
            </div>
          </div>
        );
      case 'REVISE':
        return (
          <div className="p-4 rounded-xl bg-amber-950/70 border-2 border-amber-500 flex items-center gap-3">
            <AlertTriangle size={24} className="text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400 block">
                AUDIT VERDICT: REVISE REQUIRED
              </span>
              <h3 className="text-sm font-bold text-white">
                REVISE - CORRECTABLE GAPS IDENTIFIED
              </h3>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                Certain claims require additional physical test verification or clearer contradiction disclosure before sign-off.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 rounded-xl bg-rose-950/70 border-2 border-rose-500 flex items-center gap-3">
            <XCircle size={24} className="text-rose-400 flex-shrink-0" />
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-rose-400 block">
                AUDIT VERDICT: REJECTED
              </span>
              <h3 className="text-sm font-bold text-white">
                REJECT - MATERIAL DEFECTS OR SAFETY VIOLATION
              </h3>
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                Critical unsupported claims, unregistered citations, or unsafe operational directives detected.
              </p>
            </div>
          </div>
        );
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold">CRITICAL</span>;
      case 'MAJOR':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">MAJOR</span>;
      case 'MINOR':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-bold">MINOR</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">INFORMATIONAL</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Action */}
      <div className="card-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert size={16} className="text-sky-400" /> Prompt 6: Independent Engineering QA & Red-Team Auditor
          </h2>
          <p className="text-xs text-slate-400">
            Adversarial evaluation engine that challenges conclusions, audits citation integrity, and checks safety policies.
          </p>
        </div>

        {onRerunQA && (
          <button
            onClick={onRerunQA}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Activity size={14} /> Re-run Red-Team Audit
          </button>
        )}
      </div>

      {/* Decision Banner */}
      {getDecisionBadge(qaReview.decision)}

      {/* KPI Cards: Traceability Score, Hallucination, Safety Guard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Traceability Gauge */}
        <div className="card-panel p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Evidence Traceability Score</span>
            <span className="text-sm font-mono font-bold text-sky-400">{qaReview.traceability_score_pct}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                qaReview.traceability_score_pct >= 90
                  ? 'bg-emerald-500'
                  : qaReview.traceability_score_pct >= 80
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${qaReview.traceability_score_pct}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Percentage of material timeline and hypothesis claims grounded in verified evidence IDs.
          </p>
        </div>

        {/* Hallucination Shield */}
        <div className="card-panel p-4 flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              !qaReview.hallucination_detected
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Hallucination Defense</span>
            <span className={`text-xs font-semibold ${!qaReview.hallucination_detected ? 'text-emerald-400' : 'text-rose-400'}`}>
              {!qaReview.hallucination_detected ? 'PASSED: Zero Unregistered IDs' : 'FAILED: Hallucination Detected'}
            </span>
          </div>
        </div>

        {/* Safety Policy Guard */}
        <div className="card-panel p-4 flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              qaReview.safety_policy_passed
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}
          >
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Safety Policy Guard</span>
            <span className={`text-xs font-semibold ${qaReview.safety_policy_passed ? 'text-emerald-400' : 'text-rose-400'}`}>
              {qaReview.safety_policy_passed ? 'PASSED: LOTO & PTW Enforced' : 'VIOLATION: Unsafe Action'}
            </span>
          </div>
        </div>
      </div>

      {/* Audit Findings Register */}
      <div className="card-panel p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          Auditor Findings & Remediation Register ({qaReview.findings.length})
        </h3>

        {qaReview.findings.length > 0 ? (
          <div className="space-y-2.5">
            {qaReview.findings.map((f, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200">{f.claim}</span>
                  {getSeverityBadge(f.severity)}
                </div>

                <p className="text-slate-400 text-[11px]">{f.reason}</p>

                <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-sky-300 font-mono">
                  <strong className="text-slate-500 uppercase text-[9px] block">Required Remediation:</strong>
                  {f.remediation}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            Zero blocking findings. The investigation is verified and ready for authorized human sign-off.
          </div>
        )}

        <div className="text-right text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800">
          Auditor Engine: {qaReview.auditor_engine} • Timestamp: {qaReview.audited_at}
        </div>
      </div>
    </div>
  );
};
