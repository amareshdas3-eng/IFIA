import React from 'react';
import { Hypothesis } from '../types';
import { HelpCircle, CheckCircle2, XCircle, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface HypothesisMatrixProps {
  hypotheses: Hypothesis[];
  onSelectEvidence?: (evidenceId: string) => void;
}

export const HypothesisMatrix: React.FC<HypothesisMatrixProps> = ({
  hypotheses,
  onSelectEvidence
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RETAINED':
        return (
          <span className="subtle-badge bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            Retained Lead Hypothesis
          </span>
        );
      case 'REJECTED':
        return (
          <span className="subtle-badge bg-rose-950/80 text-rose-400 border border-rose-800">
            Falsified / Rejected
          </span>
        );
      case 'DOWNGRADED':
        return (
          <span className="subtle-badge bg-amber-950/80 text-amber-400 border border-amber-800">
            Downgraded / Unlikely
          </span>
        );
      default:
        return (
          <span className="subtle-badge bg-slate-800 text-slate-300 border border-slate-700">
            Unverified
          </span>
        );
    }
  };

  const getConfidenceBadge = (confidence: Hypothesis['confidence']) => {
    let color = 'text-slate-400 border-slate-700 bg-slate-900';
    if (confidence.label === 'HIGH') color = 'text-emerald-400 border-emerald-800 bg-emerald-950/60';
    if (confidence.label === 'MEDIUM') color = 'text-sky-400 border-sky-800 bg-sky-950/60';
    if (confidence.label === 'LOW') color = 'text-amber-400 border-amber-800 bg-amber-950/60';

    return (
      <div className="flex items-center gap-1.5">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${color}`}>
          {confidence.label} CONFIDENCE
        </span>
        <span className="text-[10px] text-slate-500 font-mono" title="Qualitative Model Assessment - NOT a statistically calibrated probability">
          (Heuristic Score: {confidence.heuristic_score ?? 85}/100)
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="card-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <HelpCircle size={16} className="text-sky-400" /> Competing Failure Hypotheses Evaluation Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Rigorous evaluation of competing mechanisms. Hypotheses remain active until disproven by physical tests.
          </p>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <ShieldCheck size={14} className="text-sky-400" />
          <span>Falsification Criterion Enforced</span>
        </div>
      </div>

      {/* Grid of Hypotheses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {hypotheses.map((h) => {
          return (
            <div
              key={h.hypothesis_id}
              className={`card-panel p-5 flex flex-col justify-between space-y-4 card-panel-hover ${
                h.status === 'RETAINED' ? 'border-sky-500/70' : ''
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                    {h.hypothesis_id}
                  </span>
                  {getStatusBadge(h.status)}
                </div>

                <h3 className="text-sm font-bold text-slate-100 mb-2 leading-snug">
                  {h.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {h.description}
                </p>

                {/* Physical Mechanism & Engineering Standards */}
                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 mb-3 text-xs">
                  <strong className="block text-[11px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                    Physical Engineering Rationale:
                  </strong>
                  <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                    {h.physical_rationale}
                  </p>
                </div>

                {/* Evidence Links */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                      Supporting Evidence:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {h.supporting_evidence_ids.length > 0 ? (
                        h.supporting_evidence_ids.map((id) => (
                          <button
                            key={id}
                            onClick={() => onSelectEvidence && onSelectEvidence(id)}
                            className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-mono font-bold flex items-center gap-1 hover:bg-emerald-900 transition"
                          >
                            <CheckCircle2 size={10} /> {id}
                          </button>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">None registered</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                      Contradicting Evidence:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {h.contradicting_evidence_ids.length > 0 ? (
                        h.contradicting_evidence_ids.map((id) => (
                          <button
                            key={id}
                            onClick={() => onSelectEvidence && onSelectEvidence(id)}
                            className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-mono font-bold flex items-center gap-1 hover:bg-rose-900 transition"
                          >
                            <XCircle size={10} /> {id}
                          </button>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">None registered</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Evidence / Gaps */}
                  {h.missing_evidence && h.missing_evidence.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/60 text-amber-200">
                      <span className="text-[10px] uppercase tracking-wider font-bold block mb-1 flex items-center gap-1 text-amber-300">
                        <AlertCircle size={10} /> Missing Evidence & Gaps:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-200/90">
                        {h.missing_evidence.map((me, i) => (
                          <li key={i}>{me}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Section: Confidence, Falsification & Diagnostic Next Step */}
              <div className="border-t border-slate-800 pt-3 space-y-2.5">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                    Confidence Assessment:
                  </span>
                  {getConfidenceBadge(h.confidence)}
                </div>

                <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px]">
                  <strong className="block text-slate-400 text-[10px] uppercase font-semibold mb-0.5">
                    Falsification Test:
                  </strong>
                  <p className="text-slate-300">{h.falsification_test}</p>
                </div>

                <div className="p-2 rounded bg-sky-950/40 border border-sky-800 text-[11px]">
                  <strong className="block text-sky-400 text-[10px] uppercase font-semibold mb-0.5 flex items-center gap-1">
                    <ArrowRight size={10} /> Next Diagnostic Inspection:
                  </strong>
                  <p className="text-slate-200">{h.next_diagnostic_step}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
