import React from 'react';
import { TimelineEvent, EvidenceRecord } from '../types';
import { Clock, Eye, Sparkles, CheckCircle2 } from 'lucide-react';

interface TimelineViewProps {
  timeline: TimelineEvent[];
  evidenceRegister: EvidenceRecord[];
  onSelectEvidence?: (evidenceId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  timeline,
  onSelectEvidence
}) => {
  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="card-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Clock size={16} className="text-sky-400" /> Event Chronology & Sequence Reconstruction
          </h2>
          <p className="text-xs text-slate-400">
            Mandatory distinction between observed physical facts and inferred thermodynamic/chemical events.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-semibold">
            <Eye size={12} /> Observed Fact
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-950/60 text-purple-300 border border-purple-800 font-semibold">
            <Sparkles size={12} /> Engineering Inference
          </span>
        </div>
      </div>

      {/* Vertical Interactive Timeline */}
      <div className="card-panel p-6">
        <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
          {timeline.map((event, idx) => {
            const isObserved = event.fact_or_inference === 'OBSERVED';

            return (
              <div key={idx} className="relative group">
                {/* Node icon marker */}
                <div
                  className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                    isObserved
                      ? 'bg-slate-900 border-emerald-500 text-emerald-400'
                      : 'bg-slate-900 border-purple-500 text-purple-400'
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Event Card */}
                <div className="card-panel p-4 card-panel-hover">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-500" />
                      {new Date(event.timestamp).toUTCString()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                          isObserved
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : 'bg-purple-950/80 text-purple-300 border-purple-800'
                        }`}
                      >
                        {event.fact_or_inference}
                      </span>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                        {event.timestamp_quality}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-sans mb-3">
                    {event.event}
                  </p>

                  {/* Supporting Evidence Chips */}
                  {event.evidence_ids && event.evidence_ids.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-800/60">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Traceable Evidence:
                      </span>
                      {event.evidence_ids.map((id) => (
                        <button
                          key={id}
                          onClick={() => onSelectEvidence && onSelectEvidence(id)}
                          className="px-2 py-0.5 rounded bg-sky-950/80 hover:bg-sky-900 text-sky-400 border border-sky-800 text-[11px] font-mono font-bold transition flex items-center gap-1"
                        >
                          <CheckCircle2 size={10} /> {id}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
