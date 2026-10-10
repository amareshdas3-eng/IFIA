import React, { useState } from 'react';
import { EvidenceRecord, EvidenceSourceType } from '../types';
import { FileText, AlertOctagon, ShieldCheck, Tag, ExternalLink, Filter, Search } from 'lucide-react';

interface EvidenceExplorerProps {
  evidenceRegister: EvidenceRecord[];
}

export const EvidenceExplorer: React.FC<EvidenceExplorerProps> = ({ evidenceRegister }) => {
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(evidenceRegister[0] || null);

  const sourceTypes: EvidenceSourceType[] = [
    'RELAY_RECORD',
    'ALARM_LOG',
    'DGA_ANALYSIS',
    'VIBRATION_SPECTRUM',
    'INSPECTION_RECORD',
    'MAINTENANCE_HISTORY',
    'OPERATOR_LOG',
    'COMMISSIONING_TEST'
  ];

  const filteredList = evidenceRegister.filter(item => {
    const matchesSource = selectedSource === 'ALL' || item.source_type === selectedSource;
    const matchesQuery =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.evidence_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.raw_content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesQuery;
  });

  const getReliabilityColor = (rel: string) => {
    switch (rel) {
      case 'HIGH':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
      case 'MEDIUM':
        return 'text-sky-400 bg-sky-950/60 border-sky-800';
      case 'QUESTIONABLE':
        return 'text-rose-400 bg-rose-950/60 border-rose-800';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Filter Controls */}
      <div className="card-panel p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <FileText size={16} className="text-sky-400" /> Verified Evidence Register & Normalization Layer
          </h2>
          <p className="text-xs text-slate-400">
            {evidenceRegister.length} ingested records normalized to UTC. Direct citations constrain all LLM reasoning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search evidence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-1">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Source Types</option>
              {sourceTypes.map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Evidence List Column */}
        <div className="lg:col-span-5 space-y-2">
          {filteredList.map((item) => {
            const isSelected = selectedEvidence?.evidence_id === item.evidence_id;

            return (
              <div
                key={item.evidence_id}
                onClick={() => setSelectedEvidence(item)}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-500 shadow-md shadow-sky-950'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    {item.evidence_id}
                    {item.contradiction_flag && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                        <AlertOctagon size={10} /> Contradiction
                      </span>
                    )}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getReliabilityColor(item.reliability)}`}>
                    {item.reliability}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-slate-200 mb-1 line-clamp-1">{item.title}</h4>

                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 font-sans">
                  {item.raw_content}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-mono">{new Date(item.timestamp).toUTCString().slice(5, 22)}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[9px]">
                    {item.source_type}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredList.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500 card-panel">
              No evidence matching search criteria.
            </div>
          )}
        </div>

        {/* Detailed Inspector Column */}
        <div className="lg:col-span-7">
          {selectedEvidence ? (
            <div className="card-panel p-5 space-y-4 sticky top-28">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                      {selectedEvidence.evidence_id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{selectedEvidence.source_type}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{selectedEvidence.title}</h3>
                </div>

                <div className="text-right">
                  <span className={`text-xs px-2.5 py-1 rounded border font-semibold inline-block ${getReliabilityColor(selectedEvidence.reliability)}`}>
                    Reliability: {selectedEvidence.reliability}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Recorded: {selectedEvidence.timestamp}
                  </p>
                </div>
              </div>

              {/* Contradiction Warning */}
              {selectedEvidence.contradiction_flag && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
                  <AlertOctagon size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong className="block text-rose-300 font-semibold mb-0.5">Contradiction Flag Active</strong>
                    This source assertion is directly contradicted by physical or digital counter-evidence (e.g. line surge arrester counter readings). The RCA evaluation must address and falsify this claim.
                  </div>
                </div>
              )}

              {/* Raw Record Content Monospace Box */}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Raw Source Record Excerpt
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-60">
                  {selectedEvidence.raw_content}
                </div>
              </div>

              {/* Traceability Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Source File / Device Path</span>
                  <span className="text-xs text-slate-300 font-mono flex items-center gap-1 truncate">
                    <ExternalLink size={12} className="text-sky-400 flex-shrink-0" />
                    {selectedEvidence.source_reference}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Timestamp Quality</span>
                  <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    {selectedEvidence.is_unreliable_timestamp ? 'Unreliable Drift Detected' : 'Verified Source Timestamp (NTP Synchronized)'}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {selectedEvidence.tags && selectedEvidence.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <Tag size={12} className="text-slate-500" />
                  {selectedEvidence.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card-panel p-8 text-center text-xs text-slate-500">
              Select an evidence item to inspect its source records and audit trail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
