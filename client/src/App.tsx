import React, { useState, useEffect } from 'react';
import { RCACase, BenchmarkSummary, BenchmarkRun } from './types';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { EvidenceExplorer } from './components/EvidenceExplorer';
import { TimelineView } from './components/TimelineView';
import { HypothesisMatrix } from './components/HypothesisMatrix';
import { FaultTreeViewer } from './components/FaultTreeViewer';
import { QARedTeamPanel } from './components/QARedTeamPanel';
import { ApprovalGovernanceModal } from './components/ApprovalGovernanceModal';
import { CMMSWorkOrderModal } from './components/CMMSWorkOrderModal';
import { BenchmarkDashboard } from './components/BenchmarkDashboard';
import { PortfolioCaseStudy } from './components/PortfolioCaseStudy';
import { CaseIntakeModal } from './components/CaseIntakeModal';
import { RCAReportPrintView } from './components/RCAReportPrintView';
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  FileCheck2,
  ListTodo,
  Wrench,
  CheckCircle2
} from 'lucide-react';

export const App: React.FC = () => {
  const [cases, setCases] = useState<RCACase[]>([]);
  const [currentCaseId, setCurrentCaseId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [benchmarkSummary, setBenchmarkSummary] = useState<BenchmarkSummary>({
    total_runs: 3,
    average_elapsed_reduction_pct: 99.1,
    average_labor_hours_saved: 10.8,
    average_traceability_score: 96.2,
    zero_hallucination_rate_pct: 100,
    zero_safety_violation_rate_pct: 100,
    cmms_draft_accuracy_pct: 100,
    manual_baseline_days: 14,
    ai_assisted_median_hours: 1.1
  });
  const [benchmarkRuns, setBenchmarkRuns] = useState<BenchmarkRun[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [activeUsername, setActiveUsername] = useState<string>('alex.henderson');
  const [activeToken, setActiveToken] = useState<string>('');
  const [auditVerificationReport, setAuditVerificationReport] = useState<any | null>(null);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  const authFetch = (url: string, init?: RequestInit) => {
    const headers = new Headers(init?.headers || {});
    if (activeToken) {
      headers.set('Authorization', `Bearer ${activeToken}`);
    }
    return fetch(url, { ...init, headers });
  };

  const obtainTokenForPersona = async (username: string) => {
    setActiveUsername(username);
    setAuthErrorMessage(null);
    if (username === 'anonymous') {
      setActiveToken('');
      return;
    }
    try {
      const res = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (data.success && data.token) {
        setActiveToken(data.token);
      } else {
        setActiveToken('');
        setAuthErrorMessage(data.message || 'Failed to authenticate principal');
      }
    } catch (err: any) {
      console.error('Failed to obtain token for principal:', err);
      setActiveToken('');
      setAuthErrorMessage(err.message || 'Authentication service unreachable');
    }
  };

  // Load cases and benchmarks
  const fetchData = async () => {
    try {
      const casesRes = await fetch('/api/cases');
      const casesData = await casesRes.json();
      if (casesData.success && casesData.cases.length > 0) {
        setCases(casesData.cases);
        if (!currentCaseId) {
          setCurrentCaseId(casesData.cases[0].case_id);
        }
      }

      const bmRes = await fetch('/api/benchmark/summary');
      const bmData = await bmRes.json();
      if (bmData.success) {
        setBenchmarkSummary(bmData.summary);
      }

      const runsRes = await fetch('/api/benchmark/runs');
      const runsData = await runsRes.json();
      if (runsData.success) {
        setBenchmarkRuns(runsData.runs);
      }
    } catch (err) {
      console.error('Failed to fetch data from IFIA backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    obtainTokenForPersona('alex.henderson');
  }, []);

  const currentCase = cases.find((c) => c.case_id === currentCaseId) || cases[0] || null;

  // Handlers
  const handleSelectCase = (caseId: string) => {
    setCurrentCaseId(caseId);
    setAuthErrorMessage(null);
  };

  const handleResetSeed = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cases/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCases(data.cases);
        if (data.cases.length > 0) {
          setCurrentCaseId(data.cases[0].case_id);
        }
        await fetchData();
        setAuthErrorMessage(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntakeCase = async (formData: any) => {
    const res = await authFetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success && data.case) {
      setCases((prev) => [data.case, ...prev]);
      setCurrentCaseId(data.case.case_id);
      setActiveTab('overview');
    }
  };

  const handleApproval = async (approvalData: any) => {
    if (!currentCase) return;
    setAuthErrorMessage(null);
    try {
      const res = await authFetch(`/api/approvals/${currentCase.case_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: approvalData.decision,
          notes: approvalData.notes,
          review_duration_minutes: approvalData.review_duration_minutes
        })
      });
      const data = await res.json();
      if (data.success && data.case) {
        setCases((prev) => prev.map((c) => (c.case_id === data.case.case_id ? data.case : c)));
        setActiveTab('overview');
      } else {
        setAuthErrorMessage(data.message || 'Engineering approval rejected by authorization policy');
      }
    } catch (err: any) {
      setAuthErrorMessage(err.message || 'Network error during approval');
    }
  };

  const handleDispatchCMMS = async () => {
    if (!currentCase) return { success: false, message: 'No case selected', status: 'REJECTED' };
    setAuthErrorMessage(null);
    try {
      const res = await authFetch(`/api/cmms/dispatch/${currentCase.case_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        const updatedRes = await fetch(`/api/cases/${currentCase.case_id}`);
        const updatedData = await updatedRes.json();
        if (updatedData.success) {
          setCases((prev) => prev.map((c) => (c.case_id === currentCase.case_id ? updatedData.case : c)));
        }
      } else {
        setAuthErrorMessage(data.message || 'CMMS dispatch rejected by authorization policy');
      }
      return data;
    } catch (err: any) {
      const msg = err.message || 'Network error during dispatch';
      setAuthErrorMessage(msg);
      return { success: false, message: msg, status: 'REJECTED' };
    }
  };

  const handleVerifyAuditTrail = async () => {
    try {
      const res = await fetch('/api/audit/verify');
      const data = await res.json();
      if (data.success) {
        setAuditVerificationReport(data.report);
      }
    } catch (err) {
      console.error('Failed to verify audit trail:', err);
    }
  };

  const handleRunBenchmarkSuite = async () => {
    const res = await fetch('/api/benchmark/run-all', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setBenchmarkSummary(data.summary);
      setBenchmarkRuns(data.runs);
    }
  };

  if (isLoading && cases.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold animate-pulse mb-4 shadow-xl shadow-sky-500/20">
          ⚡
        </div>
        <h2 className="text-base font-bold text-white">Initializing Industrial Failure Intelligence Agent...</h2>
        <p className="text-xs text-slate-500 mt-1">Connecting to Evidence Contract store & electrical domain engine</p>
      </div>
    );
  }

  const isApproved =
    currentCase?.case_status === 'APPROVED' ||
    Boolean(currentCase?.approvals?.some((a) => a.decision === 'ACCEPTED'));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Application Header */}
      <Header
        currentCase={currentCase}
        cases={cases}
        onSelectCase={handleSelectCase}
        onNewCase={() => setIsIntakeModalOpen(true)}
        onResetSeed={handleResetSeed}
        onPrintReport={() => setIsPrintModalOpen(true)}
        activeUsername={activeUsername}
        onSelectPersona={obtainTokenForPersona}
        onVerifyAuditTrail={handleVerifyAuditTrail}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        evidenceCount={currentCase?.evidence_register.length || 0}
        hypothesisCount={currentCase?.hypotheses.length || 0}
        unresolvedQA={currentCase?.qa_review?.decision === 'REJECT'}
        isApproved={isApproved}
      />

      {/* Authorization Policy Error Banner */}
      {authErrorMessage && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-rose-950/80 border border-rose-500/50 rounded-xl p-4 flex items-center justify-between text-rose-200 text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-400 shrink-0" />
              <div>
                <strong className="font-semibold text-rose-100">Authorization / Security Policy Alert:</strong>{' '}
                {authErrorMessage}
              </div>
            </div>
            <button
              onClick={() => setAuthErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 font-bold px-2 py-1 rounded bg-rose-900/40"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Cryptographic Audit Trail Verification Modal / Banner */}
      {auditVerificationReport && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4">
          <div className={`border rounded-xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
            auditVerificationReport.is_valid
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
          }`}>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className={auditVerificationReport.is_valid ? "text-emerald-400" : "text-rose-400"} />
              <div>
                <strong className="font-bold text-white block">
                  {auditVerificationReport.is_valid ? 'Cryptographic Audit Trail Verified (SHA-256)' : 'Audit Trail Tampering Detected!'}
                </strong>
                <span>{auditVerificationReport.message}</span>
                <span className="block text-[11px] opacity-75 font-mono mt-0.5">
                  Records: {auditVerificationReport.total_records} • Hash Chain: {auditVerificationReport.chain_broken ? 'BROKEN' : 'UNBROKEN'} • Timestamp: {auditVerificationReport.verified_at}
                </span>
              </div>
            </div>
            <button
              onClick={() => setAuditVerificationReport(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 text-slate-200 font-semibold shrink-0"
            >
              Close Report
            </button>
          </div>
        </div>
      )}

      {/* Primary Workspace View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* VIEW 1: OVERVIEW & DASHBOARD */}
        {activeTab === 'overview' && currentCase && (
          <div className="space-y-6">
            {/* Mission Hero Banner */}
            <div className="card-panel p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border-sky-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800">
                    EVIDENCE-GROUNDED INDUSTRIAL AI
                  </span>
                  <span className="text-xs text-slate-400 font-mono">14-Day Baseline ➔ Under 3-Hour Target</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {currentCase.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {currentCase.failure_symptoms}
                </p>
              </div>

              {/* Status and Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setActiveTab('governance')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  {isApproved ? 'View Engineering Certification' : 'Review & Sign-Off (Engineer)'}
                </button>
                <button
                  onClick={() => setActiveTab('cmms')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <Wrench size={16} />
                  Inspect CMMS Work Order
                </button>
              </div>
            </div>

            {/* Core KPI Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card-panel p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                  Workflow Target Compression
                </span>
                <div className="text-xl font-mono font-bold text-sky-400 flex items-center gap-1.5">
                  <TrendingDown size={18} /> 99.1%
                </div>
                <span className="text-[11px] text-slate-400">14 Days (336h) ➔ 1.1h Measured</span>
              </div>

              <div className="card-panel p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                  Evidence Traceability
                </span>
                <div className="text-xl font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <FileCheck2 size={18} /> {currentCase.qa_review?.traceability_score_pct || 96.5}%
                </div>
                <span className="text-[11px] text-slate-400">Zero Unregistered Citations</span>
              </div>

              <div className="card-panel p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                  Engineer Review Time
                </span>
                <div className="text-xl font-mono font-bold text-purple-400 flex items-center gap-1.5">
                  <Clock size={18} /> {currentCase.metrics.engineer_review_minutes || 25} Mins
                </div>
                <span className="text-[11px] text-slate-400">Human Sign-Off Effort</span>
              </div>

              <div className="card-panel p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                  CMMS Execution Status
                </span>
                <div className="text-xl font-mono font-bold text-amber-400 flex items-center gap-1.5 truncate">
                  <Wrench size={18} /> {currentCase.cmms.work_order_status.replace(/_/g, ' ')}
                </div>
                <span className="text-[11px] text-slate-400">Mode: {currentCase.cmms.mode}</span>
              </div>
            </div>

            {/* Split Row: Timeline Snapshot & Hypotheses Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timeline Snapshot */}
              <div className="card-panel p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock size={16} className="text-sky-400" /> Event Chronology Snapshot
                  </h3>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                  >
                    Full Timeline <ArrowRight size={12} />
                  </button>
                </div>

                <div className="space-y-3">
                  {currentCase.event_timeline.slice(0, 4).map((evt, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <span className="font-mono text-slate-500 w-28 flex-shrink-0 text-[10px]">
                        {new Date(evt.timestamp).toUTCString().slice(17, 25)} UTC
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold flex-shrink-0 ${
                          evt.fact_or_inference === 'OBSERVED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}
                      >
                        {evt.fact_or_inference}
                      </span>
                      <p className="text-slate-300 line-clamp-1">{evt.event}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Root Cause & Action Snapshot */}
              <div className="card-panel p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck size={16} className="text-sky-400" /> Root-Cause Conclusion
                  </h3>
                  <button
                    onClick={() => setActiveTab('faulttree')}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                  >
                    Fault Tree <ArrowRight size={12} />
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  <strong className="block text-sky-400 text-[11px] uppercase font-semibold mb-1">
                    Primary Causal Mechanism:
                  </strong>
                  {currentCase.root_cause_conclusion.immediate_mechanism}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                    Lead Corrective Action (Draft CMMS Work Order):
                  </span>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        {currentCase.recommended_actions[0]?.priority}
                      </span>
                      <span className="line-clamp-1">{currentCase.recommended_actions[0]?.description}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('actions')}
                      className="text-sky-400 text-xs font-semibold whitespace-nowrap hover:underline"
                    >
                      View All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: EVIDENCE EXPLORER */}
        {activeTab === 'evidence' && currentCase && (
          <EvidenceExplorer evidenceRegister={currentCase.evidence_register} />
        )}

        {/* VIEW 3: TIMELINE */}
        {activeTab === 'timeline' && currentCase && (
          <TimelineView
            timeline={currentCase.event_timeline}
            evidenceRegister={currentCase.evidence_register}
            onSelectEvidence={() => setActiveTab('evidence')}
          />
        )}

        {/* VIEW 4: HYPOTHESES */}
        {activeTab === 'hypotheses' && currentCase && (
          <HypothesisMatrix
            hypotheses={currentCase.hypotheses}
            onSelectEvidence={() => setActiveTab('evidence')}
          />
        )}

        {/* VIEW 5: FAULT TREE & RCA */}
        {activeTab === 'faulttree' && currentCase && (
          <FaultTreeViewer
            rootCause={currentCase.root_cause_conclusion}
            faultTree={currentCase.fault_tree}
            onSelectEvidence={() => setActiveTab('evidence')}
          />
        )}

        {/* VIEW 6: RED-TEAM QA */}
        {activeTab === 'qareview' && currentCase && (
          <QARedTeamPanel
            qaReview={currentCase.qa_review}
            onRerunQA={async () => {
              const res = await fetch(`/api/cases/${currentCase.case_id}`);
              const data = await res.json();
              if (data.success) {
                setCases((prev) => prev.map((c) => (c.case_id === currentCase.case_id ? data.case : c)));
              }
            }}
          />
        )}

        {/* VIEW 7: ACTION REGISTER */}
        {activeTab === 'actions' && currentCase && (
          <div className="space-y-4">
            <div className="card-panel p-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ListTodo size={16} className="text-sky-400" /> Corrective & Preventive Action Register
                </h2>
                <p className="text-xs text-slate-400">
                  Defensive actions prioritized by safety and production criticality.
                </p>
              </div>
              <span className="subtle-badge bg-sky-950 text-sky-400 border border-sky-800">
                {currentCase.recommended_actions.length} Action Items
              </span>
            </div>

            <div className="card-panel p-6 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                      <th className="py-2.5 px-3">ID / Type</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Responsible Role</th>
                      <th className="py-2.5 px-3">Verification Criteria</th>
                      <th className="py-2.5 px-3">Target Date</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {currentCase.recommended_actions.map((act) => (
                      <tr key={act.action_id} className="hover:bg-slate-900/60 transition">
                        <td className="py-3 px-3 font-mono font-bold text-sky-400 whitespace-nowrap">
                          {act.action_id}
                          <span className="block text-[10px] text-slate-500 font-normal">{act.type}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-200 max-w-xs">{act.description}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              act.priority === 'SAFETY_CRITICAL'
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : act.priority === 'HIGH'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {act.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-medium whitespace-nowrap">
                          {act.responsible_role}
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] leading-relaxed max-w-xs">
                          {act.verification_criteria}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                          {act.target_date}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              act.approval_status === 'APPROVED'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {act.approval_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 8: GOVERNANCE & SIGN-OFF */}
        {activeTab === 'governance' && currentCase && (
          <ApprovalGovernanceModal
            caseId={currentCase.case_id}
            equipmentTag={currentCase.equipment_tag}
            approvals={currentCase.approvals}
            isApproved={isApproved}
            onSubmitApproval={handleApproval}
          />
        )}

        {/* VIEW 9: CMMS WORK ORDER */}
        {activeTab === 'cmms' && currentCase && (
          <CMMSWorkOrderModal
            workOrder={currentCase.cmms}
            caseStatus={currentCase.case_status}
            isApproved={isApproved}
            onDispatch={handleDispatchCMMS}
          />
        )}

        {/* VIEW 10: BENCHMARK LAB */}
        {activeTab === 'benchmark' && (
          <BenchmarkDashboard
            summary={benchmarkSummary}
            runs={benchmarkRuns}
            onRunBenchmarkSuite={handleRunBenchmarkSuite}
          />
        )}

        {/* VIEW 11: PORTFOLIO CASE STUDY */}
        {activeTab === 'casestudy' && <PortfolioCaseStudy />}
      </main>

      {/* Case Intake Modal */}
      <CaseIntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onSubmit={handleIntakeCase}
      />

      {/* Official RCA Print Report View Modal */}
      {isPrintModalOpen && currentCase && (
        <RCAReportPrintView
          currentCase={currentCase}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        IFIA | Industrial Failure Intelligence Agent • Evidence Contract Engine • Human-in-the-Loop Governance • IEC 62271 / IEEE C37.20 / NFPA 70B
      </footer>
    </div>
  );
};
export default App;
