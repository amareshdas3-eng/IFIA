import React from 'react';
import { RCACase } from '../types';
import { Printer, X } from 'lucide-react';

interface RCAReportPrintViewProps {
  currentCase: RCACase;
  onClose: () => void;
}

export const RCAReportPrintView: React.FC<RCAReportPrintViewProps> = ({ currentCase, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur overflow-y-auto p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Floating Print Controls */}
        <div className="flex items-center justify-between no-print bg-slate-900 border border-slate-700 p-3 rounded-xl sticky top-4 shadow-xl z-10">
          <span className="text-xs font-bold text-white font-mono">
            OFFICIAL ENGINEERING RCA REPORT EXPORT PREVIEW
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow"
            >
              <Printer size={14} /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Formal Printable Document Sheet */}
        <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-2xl space-y-6 font-sans border border-slate-300">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="text-[10px] tracking-widest uppercase font-mono font-bold text-slate-600">
                INDUSTRIAL RELIABILITY & ELECTRICAL ASSET MANAGEMENT
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 mt-1">
                ROOT CAUSE ANALYSIS (RCA) INVESTIGATION REPORT
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Case Reference: <strong className="font-mono text-slate-900">{currentCase.case_id}</strong> • Plant: <strong>{currentCase.plant}</strong>
              </p>
            </div>

            <div className="text-right text-xs font-mono">
              <span className="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-bold uppercase inline-block">
                STATUS: {currentCase.case_status}
              </span>
              <div className="text-[10px] text-slate-500 mt-1">
                Generated: {new Date().toUTCString()}
              </div>
            </div>
          </div>

          {/* Asset & Event Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Equipment Tag</span>
              <strong className="font-mono text-slate-900">{currentCase.equipment_tag}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Equipment Class</span>
              <span className="text-slate-800">{currentCase.equipment_class}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Incident Time</span>
              <span className="font-mono text-slate-800">{new Date(currentCase.event_timestamp).toUTCString().slice(5, 22)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Traceability Score</span>
              <strong className="text-sky-700 font-mono">{currentCase.qa_review?.traceability_score_pct || 96.5}%</strong>
            </div>
          </div>

          {/* Section: Symptoms & Impact */}
          <div className="space-y-2 text-xs">
            <h2 className="text-xs uppercase font-extrabold text-slate-800 border-b border-slate-200 pb-1">
              1. Observed Symptoms & Operational Consequences
            </h2>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
              <p><strong>Failure Symptoms:</strong> {currentCase.failure_symptoms}</p>
              <p><strong>Operational Impact:</strong> {currentCase.operational_impact}</p>
            </div>
          </div>

          {/* Section: Chronological Event Reconstruction */}
          <div className="space-y-2 text-xs">
            <h2 className="text-xs uppercase font-extrabold text-slate-800 border-b border-slate-200 pb-1">
              2. Reconstructed Event Chronology
            </h2>
            <div className="space-y-1.5">
              {currentCase.event_timeline.map((event, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] border-b border-slate-100 pb-1">
                  <span className="font-mono text-slate-500 w-36 flex-shrink-0">
                    {new Date(event.timestamp).toUTCString().slice(5, 22)}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-200 text-slate-700 flex-shrink-0">
                    {event.fact_or_inference}
                  </span>
                  <p className="text-slate-800 leading-snug">{event.event}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Root Cause Conclusion */}
          <div className="space-y-2 text-xs">
            <h2 className="text-xs uppercase font-extrabold text-slate-800 border-b border-slate-200 pb-1">
              3. Root-Cause Analysis & Causal Determination
            </h2>
            <div className="p-3 bg-slate-100 rounded border border-slate-300 space-y-2">
              <p className="leading-relaxed"><strong>Executive Determination:</strong> {currentCase.root_cause_conclusion.statement}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-200 text-[11px]">
                <div>
                  <span className="font-bold text-slate-700 block">Immediate Mechanism:</span>
                  <span>{currentCase.root_cause_conclusion.immediate_mechanism}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block">Contributing Factors:</span>
                  <span>{currentCase.root_cause_conclusion.contributing_factors.join('; ')}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block">Systemic Deficiencies:</span>
                  <span>{currentCase.root_cause_conclusion.systemic_factors.join('; ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Corrective & Preventive Action Plan */}
          <div className="space-y-2 text-xs">
            <h2 className="text-xs uppercase font-extrabold text-slate-800 border-b border-slate-200 pb-1">
              4. Corrective, Preventive & Verification Action Register
            </h2>
            <table className="w-full text-left text-[11px] border border-slate-200">
              <thead className="bg-slate-100 text-[10px] uppercase font-mono">
                <tr className="border-b border-slate-200">
                  <th className="p-1.5">Action ID</th>
                  <th className="p-1.5">Type</th>
                  <th className="p-1.5">Description</th>
                  <th className="p-1.5">Responsible Role</th>
                  <th className="p-1.5">Verification Criteria</th>
                  <th className="p-1.5">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentCase.recommended_actions.map((act) => (
                  <tr key={act.action_id}>
                    <td className="p-1.5 font-mono font-bold">{act.action_id}</td>
                    <td className="p-1.5">{act.type}</td>
                    <td className="p-1.5 font-medium">{act.description}</td>
                    <td className="p-1.5">{act.responsible_role}</td>
                    <td className="p-1.5 text-slate-600">{act.verification_criteria}</td>
                    <td className="p-1.5 font-mono">{act.target_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section: Formal Engineering Approval Sign-Off */}
          <div className="space-y-2 text-xs border-t-2 border-slate-900 pt-4">
            <h2 className="text-xs uppercase font-extrabold text-slate-800 pb-1">
              5. Authorized Engineering Certification & Sign-Off Record
            </h2>
            {currentCase.approvals.length > 0 ? (
              <div className="space-y-2">
                {currentCase.approvals.map((app, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-300 rounded flex justify-between items-center text-xs">
                    <div>
                      <strong className="block text-slate-900">{app.reviewer_name}</strong>
                      <span className="text-slate-600 font-mono text-[11px]">{app.reviewer_role.replace(/_/g, ' ')}</span>
                      <p className="text-slate-700 italic text-[11px] mt-1">"{app.notes}"</p>
                    </div>
                    <div className="text-right font-mono text-[10px]">
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 uppercase">
                        {app.decision}
                      </span>
                      <div className="text-slate-500 mt-1">{new Date(app.timestamp).toUTCString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded text-amber-900 text-xs">
                Pending formal engineering certification. Final work order release prohibited until signed off.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
