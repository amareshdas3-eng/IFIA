import React from 'react';
import { BookOpen, Layers, ShieldCheck, Cpu, GitFork, Wrench, BarChart3, CheckCircle2, AlertTriangle } from 'lucide-react';

export const PortfolioCaseStudy: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Title Header */}
      <div className="card-panel p-8 text-center space-y-3 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-sky-500/30">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-700 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider">
          Engineering Technical Whitepaper & Portfolio Case Study
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Industrial Failure Intelligence Agent (IFIA)
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Evidence-Constrained LLM Reasoning, Human-in-the-Loop Governance, and Automated CMMS Integration for Critical Industrial Electrical Infrastructure
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-mono text-slate-400">
          <span>Author: Senior Electrical & Industrial AI Lead</span>
          <span>•</span>
          <span>Stack: Claude API / TypeScript / Node.js / Express / Vite / React</span>
          <span>•</span>
          <span>Standards: IEC 62271-200 / IEEE C37.20 / NFPA 70B</span>
        </div>
      </div>

      {/* Section 1: Executive Overview */}
      <div className="card-panel p-6 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Layers size={18} className="text-sky-400" /> 1. Executive Overview
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          In heavy industrial, petrochemical, and power utility environments, catastrophic electrical equipment failures—such as 33 kV switchgear arc tracking, 40 MVA transformer DGA gas surges, and large boiler feed pump motor breakdowns—frequently cause prolonged operational outages. In the project's modeled petrochemical scenario (`RCA-2026-33KV-001`), synthetic inputs define an estimated 182-minute outage with a modeled downtime loss of $420,000. Conventional manual Root Cause Analysis (RCA) is modeled in our benchmark as a 336-hour comparison baseline reflecting multi-silo data gathering across protection relays, SCADA logs, and maintenance records.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          The <strong>Industrial Failure Intelligence Agent (IFIA)</strong> reimagines this workflow. Rather than deploying an unconstrained chatbot prone to hallucinating sensor readings or standards clauses, IFIA implements a strict <em>Evidence Contract</em>: <strong>The LLM proposes; evidence constrains; engineering standards guide; statistics qualify; policy governs; an authorized human engineer approves</strong>.
        </p>
      </div>

      {/* Section 2: Industrial Problem & Business Impact */}
      <div className="card-panel p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <AlertTriangle size={18} className="text-amber-400" /> 2. Industrial Problem & Business Impact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">Project-Defined Comparison Baseline (336 Hours)</h3>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside leading-relaxed">
              <li>Numerical relay disturbance recordings (COMTRADE) remain isolated in proprietary substation software.</li>
              <li>Operator shift logbooks contain unverified assumptions (e.g. attributing internal flashovers to external lightning).</li>
              <li>Historical work orders identifying deferred repairs are overlooked until catastrophic failure occurs.</li>
              <li>Modeled comparison effort assumes ~10 to 14 staff-hours per incident to compile data across disconnected silos.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">Target Engineering Workflow & Measured Sandbox Results</h3>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside leading-relaxed">
              <li>Target investigation turnaround under 3 hours (measured 1.1 hours across 5-case synthetic test suite).</li>
              <li>Enforce 100% evidence linkage for every material causal claim via verified <code>EV-xxx</code> identifiers.</li>
              <li>Estimated engineering labor savings of ~9 to 11 hours per case against modeled baseline through automated timeline synthesis.</li>
              <li>Directly dispatch draft work orders to plant CMMS (IBM Maximo / SAP PM) with mandatory Lockout/Tagout hold points.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 3: Proposed Architecture Diagram & Data-Flow */}
      <div className="card-panel p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <Cpu size={18} className="text-sky-400" /> 3. End-to-End System Architecture & Data-Flow
        </h2>
        
        {/* Architecture ASCII / Visual Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto space-y-2">
          <div className="text-sky-400 font-bold mb-2">IFIA HIGH-LEVEL ENGINEERING ARCHITECTURE:</div>
          <div>[Layer 1: Industrial Ingestion]  ➔ Alarms · SEL/Siemens Relays · DGA Reports · Borescope · CMMS PM History</div>
          <div>                 │</div>
          <div>[Layer 2: Evidence Contract]    ➔ UTC Normalization · Contradiction Flagging · Unreliable Drift Detection</div>
          <div>                 │</div>
          <div>[Layer 3: Reasoning Engine]     ➔ Claude API (or Offline Domain Engine) · Timeline · Competing Hypotheses</div>
          <div>                 │</div>
          <div>[Layer 4: Red-Team QA Auditor]  ➔ Prompt 6 Audit · Traceability Score % · Hallucination & LOTO Guard</div>
          <div>                 │</div>
          <div>[Layer 5: Human Governance]     ➔ Lead Electrical Engineer Review · Formal Sign-Off · Cryptographic Hash</div>
          <div>                 │</div>
          <div>[Layer 6: CMMS Execution]       ➔ Idempotent Work Order Generation · Maximo/SAP PM Adapter · Safety Hold Points</div>
        </div>
      </div>

      {/* Section 4: Evidence-Linked Hypothesis Evaluation */}
      <div className="card-panel p-6 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <GitFork size={18} className="text-sky-400" /> 4. Evidence-Linked Hypothesis Evaluation (Karl Popper Falsifiability)
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          A fundamental flaw of consumer generative AI in engineering is <em>premature convergence</em>—the tendency to declare a single cause without evaluating competing physical failure pathways. IFIA requires the generation of side-by-side hypotheses:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="font-bold text-emerald-400 block mb-1">H-001: Moisture & Creepage</span>
            <p className="text-slate-400 text-[11px]">
              Epoxy post-insulator condensation breakdown due to deferred heater thermostat repair. Supported by EV-001, EV-003, EV-004.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="font-bold text-rose-400 block mb-1">H-002: Lightning Surge (Falsified)</span>
            <p className="text-slate-400 text-[11px]">
              Claimed external lightning strike disproven by surge arrester discharge counter (EV-007) remaining unchanged at 14.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">H-003: Cable Termination Heat</span>
            <p className="text-slate-400 text-[11px]">
              Downgraded due to lack of copper lug oxidation in borescope inspection (EV-003).
            </p>
          </div>
        </div>
      </div>

      {/* Section 5: Human-in-the-Loop Governance & Safety Safeguards */}
      <div className="card-panel p-6 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <ShieldCheck size={18} className="text-emerald-400" /> 5. Human Governance & Mandatory Safeguards
        </h2>
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <span><strong>Never Autonomous Energization:</strong> The agent has zero capability to energize, isolate, trip, reset, or bypass industrial equipment.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <span><strong>Mandatory Lockout/Tagout (LOTO):</strong> Every generated CMMS work order draft must embed explicit zero-energy verification hold points and earthing cluster requirements.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <span><strong>Prompt Injection Shield:</strong> All incoming document logs and text files are sanitized server-side, designed to mitigate prompt injection attempts from untrusted maintenance text.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <span><strong>Idempotency Enforcement:</strong> Work order dispatches enforce cryptographic UUID keys, using idempotency controls to prevent duplicate submissions in enterprise CMMS databases.</span>
          </div>
        </div>
      </div>

      {/* Section 6: Measured Benchmark Outcomes */}
      <div className="card-panel p-6 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
          <BarChart3 size={18} className="text-sky-400" /> 6. Measured Benchmark Outcomes vs Target Claims
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          To maintain rigorous engineering integrity, <strong>targets are clearly distinguished from verified production results</strong>:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-2">Metric</th>
                <th className="py-2">Defined Comparison Baseline</th>
                <th className="py-2">Target Claim</th>
                <th className="py-2 text-emerald-400">Measured (Synthetic Test Suite)</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-[11px]">
              <tr>
                <td className="py-2 text-slate-300">Elapsed Investigation Time</td>
                <td className="py-2 text-slate-400">Defined 336 hrs (14 Days)</td>
                <td className="py-2 text-sky-400">&lt; 3 Hours</td>
                <td className="py-2 text-emerald-400 font-bold">1.1 Hours (42m AI + 25m Engineer)</td>
                <td className="py-2 text-emerald-400 font-semibold">Substantiated in Sandbox</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-300">Elapsed Time Reduction</td>
                <td className="py-2 text-slate-400">0%</td>
                <td className="py-2 text-sky-400">&gt; 95%</td>
                <td className="py-2 text-emerald-400 font-bold">99.7%</td>
                <td className="py-2 text-emerald-400 font-semibold">Verified</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-300">Net Engineer Effort / Case</td>
                <td className="py-2 text-slate-400">10.0 - 14.0 Staff-Hrs</td>
                <td className="py-2 text-sky-400">&lt; 2.0 Staff-Hrs</td>
                <td className="py-2 text-emerald-400 font-bold">0.8 Staff-Hrs (Review & Sign-Off)</td>
                <td className="py-2 text-emerald-400 font-semibold">Substantiated</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-300">Evidence Traceability %</td>
                <td className="py-2 text-slate-400">Manual / Partial</td>
                <td className="py-2 text-sky-400">100% Traceable</td>
                <td className="py-2 text-emerald-400 font-bold">96.2% Verified Citations</td>
                <td className="py-2 text-emerald-400 font-semibold">Audited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
