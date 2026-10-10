import React from 'react';
import {
  LayoutDashboard,
  FileSearch,
  Clock,
  HelpCircle,
  GitFork,
  ShieldAlert,
  ListTodo,
  CheckCheck,
  Wrench,
  BarChart3,
  BookOpen
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'evidence'
  | 'timeline'
  | 'hypotheses'
  | 'faulttree'
  | 'qareview'
  | 'actions'
  | 'governance'
  | 'cmms'
  | 'benchmark'
  | 'casestudy';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  evidenceCount: number;
  hypothesisCount: number;
  unresolvedQA: boolean;
  isApproved: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  evidenceCount,
  hypothesisCount,
  unresolvedQA,
  isApproved
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'evidence', label: 'Evidence Register', icon: FileSearch, badge: evidenceCount },
    { id: 'timeline', label: 'Fault Timeline', icon: Clock },
    { id: 'hypotheses', label: 'Hypotheses', icon: HelpCircle, badge: hypothesisCount },
    { id: 'faulttree', label: 'RCA & Fault Tree', icon: GitFork },
    { id: 'qareview', label: 'Red-Team QA', icon: ShieldAlert, alert: unresolvedQA },
    { id: 'actions', label: 'Action Register', icon: ListTodo },
    { id: 'governance', label: 'Engineer Sign-Off', icon: CheckCheck, success: isApproved },
    { id: 'cmms', label: 'CMMS Work Order', icon: Wrench },
    { id: 'benchmark', label: 'Benchmark Lab', icon: BarChart3 },
    { id: 'casestudy', label: 'Portfolio Case Study', icon: BookOpen }
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-900/60 sticky top-[61px] z-30 backdrop-blur px-2 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center gap-1 py-1.5 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id as NavTab)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>

              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-sky-800 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}

              {tab.alert && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="QA Defect Found" />
              )}

              {tab.success && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Engineer Approved" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
