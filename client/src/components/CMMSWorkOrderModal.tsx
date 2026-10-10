import React, { useState } from 'react';
import { CMMSWorkOrder } from '../types';
import { Wrench, ShieldAlert, CheckCircle2, Copy, Send, Key, AlertTriangle, Layers } from 'lucide-react';

interface CMMSWorkOrderModalProps {
  workOrder: CMMSWorkOrder;
  caseStatus: string;
  isApproved: boolean;
  onDispatch: () => Promise<{ success: boolean; message: string; external_system_id?: string; status: string }>;
}

export const CMMSWorkOrderModal: React.FC<CMMSWorkOrderModalProps> = ({
  workOrder,
  caseStatus,
  isApproved,
  onDispatch
}) => {
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchResult, setDispatchResult] = useState<{
    success: boolean;
    message: string;
    external_system_id?: string;
    status: string;
  } | null>(null);

  const handleDispatch = async () => {
    setIsDispatching(true);
    setDispatchResult(null);
    try {
      const result = await onDispatch();
      setDispatchResult(result);
    } catch (err: any) {
      setDispatchResult({
        success: false,
        message: err.message || 'Dispatch failed',
        status: 'REJECTED'
      });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="card-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Wrench size={16} className="text-sky-400" /> CMMS Work-Order Generator & Execution Sandbox
          </h2>
          <p className="text-xs text-slate-400">
            Automated translation of engineer-approved RCA findings into structured Maximo / SAP PM maintenance work packages.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="subtle-badge bg-sky-950 text-sky-400 border border-sky-800 font-mono font-bold">
            MODE: {workOrder.mode}
          </span>
          <span
            className={`subtle-badge font-bold ${
              workOrder.work_order_status === 'SUBMITTED_TO_CMMS'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}
          >
            {workOrder.work_order_status}
          </span>
        </div>
      </div>

      {/* Human-in-the-Loop Governance Guard Alert */}
      {!isApproved && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800 flex items-start gap-3">
          <ShieldAlert size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-300 mb-0.5">Human Authorization Gate Enforced</h4>
            <p className="text-amber-200/80 leading-relaxed">
              This CMMS draft cannot be released to external maintenance queues until an authorized Lead Electrical Engineer signs off in the <strong>Engineer Sign-Off</strong> workspace.
            </p>
          </div>
        </div>
      )}

      {/* Main Work Order Sheet */}
      <div className="card-panel p-6 space-y-6">
        {/* Header Block */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">
              DRAFT WORK ORDER NUMBER
            </span>
            <h3 className="text-lg font-mono font-bold text-white flex items-center gap-2">
              {workOrder.work_order_id}
            </h3>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">
              TARGET ASSET TAG
            </span>
            <span className="text-sm font-mono font-bold text-sky-400 bg-sky-950 px-2.5 py-1 rounded border border-sky-800 inline-block">
              {workOrder.equipment_tag}
            </span>
          </div>
        </div>

        {/* Problem Statement */}
        <div>
          <label className="text-[11px] text-slate-400 uppercase tracking-wider font-bold block mb-1">
            Problem Description
          </label>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
            {workOrder.problem_statement}
          </div>
        </div>

        {/* Verified Failure Findings */}
        <div>
          <label className="text-[11px] text-slate-400 uppercase tracking-wider font-bold block mb-1">
            Verified Failure Findings (Evidence Grounded)
          </label>
          <ul className="space-y-1.5">
            {workOrder.failure_findings.map((ff, i) => (
              <li key={i} className="p-2 rounded bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                <span>{ff}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Safety Prerequisites (LOTO) & Inspection Hold Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert size={14} /> Safety Prerequisites & LOTO Hold
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {workOrder.safety_prerequisites.map((sp, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{sp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers size={14} /> Quality Hold Points (QA Verification)
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {workOrder.inspection_hold_points.map((hp, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>{hp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Parts Requiring Verification */}
        <div>
          <label className="text-[11px] text-slate-400 uppercase tracking-wider font-bold block mb-1">
            Bill of Materials Requiring Inventory Verification
          </label>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono space-y-1">
            {workOrder.parts_requiring_verification.map((part, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">[{i + 1}]</span>
                <span>{part}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Idempotency Key & External Ref */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Key size={14} className="text-sky-400" />
            <span className="text-slate-500 font-mono text-[11px]">Idempotency Key:</span>
            <span className="text-slate-300 font-mono text-[11px] font-bold">{workOrder.idempotency_key}</span>
          </div>

          {workOrder.cmms_system_reference && (
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold">
              <CheckCircle2 size={14} /> CMMS Ref: {workOrder.cmms_system_reference}
            </div>
          )}
        </div>

        {/* Dispatch Feedback Alert */}
        {dispatchResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 ${
              dispatchResult.success
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500 text-rose-200'
            }`}
          >
            {dispatchResult.success ? <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" /> : <AlertTriangle size={18} className="text-rose-400 flex-shrink-0" />}
            <div>
              <span className="font-bold block">{dispatchResult.message}</span>
              {dispatchResult.external_system_id && (
                <span className="font-mono text-[11px] text-emerald-300 mt-0.5 block">
                  Target CMMS Confirmation ID: {dispatchResult.external_system_id}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Dispatch Button */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {isApproved
              ? 'Ready for dispatch to plant maintenance dispatch queue.'
              : 'Sign-off required before execution.'}
          </span>

          <button
            onClick={handleDispatch}
            disabled={isDispatching || !isApproved || workOrder.work_order_status === 'SUBMITTED_TO_CMMS'}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white font-bold text-xs transition shadow-md shadow-sky-900/40 flex items-center gap-2"
          >
            <Send size={14} />
            {isDispatching
              ? 'Connecting to CMMS API...'
              : workOrder.work_order_status === 'SUBMITTED_TO_CMMS'
              ? 'Dispatched to CMMS'
              : 'Dispatch Work Order to CMMS'}
          </button>
        </div>
      </div>
    </div>
  );
};
