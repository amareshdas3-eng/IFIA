import React, { useState } from 'react';
import { HumanApprovalRecord } from '../types';
import { CheckCheck, ShieldCheck, XCircle, AlertCircle, History, Clock } from 'lucide-react';

interface ApprovalGovernanceModalProps {
  caseId: string;
  equipmentTag: string;
  approvals: HumanApprovalRecord[];
  isApproved: boolean;
  onSubmitApproval: (record: {
    reviewer_name: string;
    reviewer_role: HumanApprovalRecord['reviewer_role'];
    decision: HumanApprovalRecord['decision'];
    notes: string;
    review_duration_minutes: number;
  }) => Promise<void>;
}

export const ApprovalGovernanceModal: React.FC<ApprovalGovernanceModalProps> = ({
  caseId,
  equipmentTag,
  approvals,
  isApproved,
  onSubmitApproval
}) => {
  const [reviewerName, setReviewerName] = useState<string>('Alex Henderson, PE');
  const [reviewerRole, setReviewerRole] = useState<HumanApprovalRecord['reviewer_role']>('LEAD_ELECTRICAL_ENGINEER');
  const [decision, setDecision] = useState<HumanApprovalRecord['decision']>('ACCEPTED');
  const [notes, setNotes] = useState<string>(
    'Root cause conclusion and corrective actions reviewed against IEEE C37.20.2 standards and station single-line diagram. Scope of work is technically defensible. Approved for CMMS draft execution.'
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !notes.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitApproval({
        reviewer_name: reviewerName,
        reviewer_role: reviewerRole,
        decision,
        notes,
        review_duration_minutes: Number(durationMinutes)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="card-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <CheckCheck size={16} className="text-sky-400" /> Human-in-the-Loop Governance & Engineering Certification
          </h2>
          <p className="text-xs text-slate-400">
            Critical Design Principle: The LLM proposes; evidence constrains; an authorized human engineer approves.
          </p>
        </div>

        {isApproved && (
          <span className="subtle-badge bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center gap-1">
            <ShieldCheck size={12} /> Legally Certified
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sign-off Form Column */}
        <div className="lg:col-span-7 card-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
            Record Engineering Review Decision: <span className="font-mono text-sky-400">{caseId}</span> ({equipmentTag})
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Reviewer Name & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Authorized Reviewer Name & Title</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Engineering Role / Authority</label>
                <select
                  value={reviewerRole}
                  onChange={(e) => setReviewerRole(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="LEAD_ELECTRICAL_ENGINEER">Lead Electrical Engineer (PE / Chartered)</option>
                  <option value="SENIOR_RELIABILITY_ENGINEER">Senior Reliability Engineer</option>
                  <option value="PLANT_MAINTENANCE_MANAGER">Plant Maintenance Manager</option>
                  <option value="CHIEF_ENGINEERING_OFFICER">Chief Engineering Officer</option>
                </select>
              </div>
            </div>

            {/* Decision Radio Selector */}
            <div>
              <label className="block text-slate-400 font-semibold mb-2">Formal Engineering Decision</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecision('ACCEPTED')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2 ${
                    decision === 'ACCEPTED'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <CheckCheck size={16} className={decision === 'ACCEPTED' ? 'text-emerald-400' : 'text-slate-500'} />
                  <div>
                    <span className="font-bold block text-xs">ACCEPT & CERTIFY</span>
                    <span className="text-[10px] text-slate-400">Release for CMMS</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('REQUEST_MORE_EVIDENCE')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2 ${
                    decision === 'REQUEST_MORE_EVIDENCE'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <AlertCircle size={16} className={decision === 'REQUEST_MORE_EVIDENCE' ? 'text-amber-400' : 'text-slate-500'} />
                  <div>
                    <span className="font-bold block text-xs">REQUEST EVIDENCE</span>
                    <span className="text-[10px] text-slate-400">Additional testing needed</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('REJECTED')}
                  className={`p-3 rounded-xl border text-left transition flex items-center gap-2 ${
                    decision === 'REJECTED'
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <XCircle size={16} className={decision === 'REJECTED' ? 'text-rose-400' : 'text-slate-500'} />
                  <div>
                    <span className="font-bold block text-xs">REJECT RCA</span>
                    <span className="text-[10px] text-slate-400">Fundamental defect</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Review Duration */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Clock size={12} /> Engineer Review Effort (Minutes)
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
              <span className="text-[11px] text-slate-500 ml-2">Logged for benchmark measurement.</span>
            </div>

            {/* Engineering Notes & Rationale */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Engineering Rationale, Standards Compliance & Sign-Off Notes
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-sky-500 font-sans leading-relaxed"
                placeholder="State basis of engineering concurrence or specific deficiencies..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-md shadow-sky-900/40 flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} />
                {isSubmitting ? 'Recording Cryptographic Audit...' : 'Submit Official Engineering Decision'}
              </button>
            </div>
          </form>
        </div>

        {/* Audit History Column */}
        <div className="lg:col-span-5 card-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <History size={16} className="text-sky-400" /> Immutable Approval History ({approvals.length})
          </h3>

          {approvals.length > 0 ? (
            <div className="space-y-3">
              {approvals.map((app, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{app.reviewer_name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        app.decision === 'ACCEPTED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : app.decision === 'REJECTED'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {app.decision}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono">
                    Role: {app.reviewer_role.replace(/_/g, ' ')} • Duration: {app.review_duration_minutes}m
                  </p>

                  <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-950 p-2 rounded border border-slate-800/80">
                    "{app.notes}"
                  </p>

                  <div className="text-[10px] text-slate-500 font-mono">
                    Signed at: {new Date(app.timestamp).toUTCString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No previous approval records. This investigation is currently in draft state awaiting initial engineer sign-off.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
