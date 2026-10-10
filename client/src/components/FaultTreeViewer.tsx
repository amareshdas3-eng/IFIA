import React from 'react';
import { RootCauseConclusion, FaultTreeNode } from '../types';
import { GitFork, BookOpen, Layers, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface FaultTreeViewerProps {
  rootCause: RootCauseConclusion;
  faultTree?: FaultTreeNode;
  onSelectEvidence?: (evidenceId: string) => void;
}

export const FaultTreeViewer: React.FC<FaultTreeViewerProps> = ({
  rootCause,
  faultTree,
  onSelectEvidence
}) => {
  return (
    <div className="space-y-4">
      {/* Root Cause Conclusion Card */}
      <div className="card-panel p-5 border-l-4 border-l-sky-500 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-sky-400" /> Root-Cause Evaluation & Multi-Tier Causal Analysis
            </h2>
            <span className="subtle-badge bg-sky-950 text-sky-400 border border-sky-800">
              Status: {rootCause.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {rootCause.approved_by_human ? (
              <span className="subtle-badge bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1 font-bold">
                <CheckCircle2 size={12} /> Certified by Lead Engineer
              </span>
            ) : (
              <span className="subtle-badge bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1 font-bold">
                <AlertTriangle size={12} /> Pending Engineering Sign-Off
              </span>
            )}
          </div>
        </div>

        {/* Narrative Conclusion */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs leading-relaxed text-slate-200">
          <strong className="block text-sky-400 text-xs uppercase font-semibold mb-1">
            Executive Root-Cause Statement:
          </strong>
          {rootCause.statement}
        </div>

        {/* 3-Tier Categorization: Immediate, Contributing, Systemic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-sky-400 uppercase tracking-wider font-bold block mb-1">
              1. Immediate Failure Mechanism
            </span>
            <p className="text-xs text-slate-200">{rootCause.immediate_mechanism}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold block mb-1">
              2. Contributing Operating Factors
            </span>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
              {rootCause.contributing_factors.map((cf, i) => (
                <li key={i}>{cf}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold block mb-1">
              3. Systemic & Maintenance Factors
            </span>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
              {rootCause.systemic_factors.map((sf, i) => (
                <li key={i}>{sf}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Applicable Standards Referenced */}
        {rootCause.equipment_standards_referenced && rootCause.equipment_standards_referenced.length > 0 && (
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center gap-2 flex-wrap text-xs">
            <BookOpen size={14} className="text-sky-400 flex-shrink-0" />
            <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">
              Referenced Engineering Standards:
            </span>
            {rootCause.equipment_standards_referenced.map((std, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                {std}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Visual Fault Tree Diagram */}
      <div className="card-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitFork size={16} className="text-sky-400" /> Fault Tree Analysis (FTA) & Logic Gate Hierarchy
            </h3>
            <p className="text-xs text-slate-400">
              Boolean logic decomposition of root causes into physical intermediate barriers and basic root events.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono font-bold">
              GATE: AND
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono font-bold">
              GATE: OR
            </span>
          </div>
        </div>

        {faultTree ? (
          <div className="space-y-4 py-2">
            {/* Top Event */}
            <div className="max-w-md mx-auto p-3.5 rounded-xl bg-rose-950/80 border-2 border-rose-600 text-center shadow-lg shadow-rose-950/50">
              <span className="text-[10px] uppercase tracking-widest font-bold text-rose-300 block mb-1">
                TOP EVENT (SYSTEM LOSS)
              </span>
              <p className="text-xs font-bold text-white">{faultTree.label}</p>
              {faultTree.gate && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-900 text-sky-400 font-mono text-[10px] font-bold border border-slate-700">
                  LOGIC GATE: {faultTree.gate}
                </span>
              )}
            </div>

            {/* Connecting Line */}
            <div className="w-0.5 h-6 bg-slate-700 mx-auto" />

            {/* Intermediate Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faultTree.children?.map((child) => (
                <div key={child.id} className="card-panel p-4 space-y-3 bg-slate-900 border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                      INTERMEDIATE CONDITION
                    </span>
                    {child.gate && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                        GATE: {child.gate}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-slate-100">{child.label}</h4>

                  {/* Basic Events Under Intermediate */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                      Underlying Basic Events:
                    </span>
                    {child.children?.map((be) => (
                      <div
                        key={be.id}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 block mb-0.5">
                            {be.id} (BASIC EVENT)
                          </span>
                          <p className="text-xs text-slate-300">{be.label}</p>
                        </div>

                        {be.evidence_ids && be.evidence_ids.length > 0 && (
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            {be.evidence_ids.map((eid) => (
                              <button
                                key={eid}
                                onClick={() => onSelectEvidence && onSelectEvidence(eid)}
                                className="px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 text-[10px] font-mono font-bold border border-sky-800 hover:bg-sky-900 transition"
                              >
                                {eid}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            Fault tree structure being synthesized from evidence causality links.
          </div>
        )}
      </div>
    </div>
  );
};
