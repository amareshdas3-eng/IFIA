import React from 'react';
import { RCACase } from '../types';
import { ShieldCheck, AlertTriangle, CheckCircle2, RotateCw, PlusCircle, Printer, Cpu } from 'lucide-react';

interface HeaderProps {
  currentCase: RCACase | null;
  cases: RCACase[];
  onSelectCase: (caseId: string) => void;
  onNewCase: () => void;
  onResetSeed: () => void;
  onPrintReport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCase,
  cases,
  onSelectCase,
  onNewCase,
  onResetSeed,
  onPrintReport
}) => {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="subtle-badge bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 size={12} /> Approved by Engineer
          </span>
        );
      case 'REJECTED':
        return (
          <span className="subtle-badge bg-rose-950/80 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle size={12} /> Rejected
          </span>
        );
      case 'AWAITING_ENGINEERING_REVIEW':
        return (
          <span className="subtle-badge bg-amber-950/80 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <ShieldCheck size={12} /> Awaiting Engineer Review
          </span>
        );
      default:
        return (
          <span className="subtle-badge bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <Cpu size={12} /> Investigating
          </span>
        );
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-40 backdrop-blur px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 font-bold text-lg">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                IFIA <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono">v1.0-PROD</span>
              </h1>
              <span className="hidden sm:inline-block text-xs text-slate-500">|</span>
              <span className="hidden sm:inline-block text-xs font-medium text-slate-300">
                Industrial Failure Intelligence Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Plant: <strong className="text-slate-200">{currentCase?.plant || 'Industrial Substation'}</strong></span>
              <span>•</span>
              <span>Tag: <strong className="text-sky-400 font-mono">{currentCase?.equipment_tag || '33KV-SWG-INC-01'}</strong></span>
            </p>
          </div>
        </div>

        {/* Case Selector & Status */}
        <div className="flex flex-wrap items-center gap-2">
          {currentCase && getStatusBadge(currentCase.case_status)}

          <div className="flex items-center gap-1">
            <select
              value={currentCase?.case_id || ''}
              onChange={(e) => onSelectCase(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
            >
              {cases.map((c) => (
                <option key={c.case_id} value={c.case_id}>
                  {c.case_id}: {c.equipment_tag} ({c.equipment_class.slice(0, 24)}...)
                </option>
              ))}
            </select>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onNewCase}
              className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 transition shadow-sm"
              title="Intake new failure event"
            >
              <PlusCircle size={14} /> Intake Case
            </button>

            <button
              onClick={onResetSeed}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              title="Reload synthetic industrial cases"
            >
              <RotateCw size={14} />
            </button>

            <button
              onClick={onPrintReport}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition flex items-center gap-1"
              title="Print official RCA report"
            >
              <Printer size={14} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
