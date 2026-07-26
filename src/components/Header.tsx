import React from 'react';
import { FileText, Sparkles, History, HelpCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
  onOpenHistory: () => void;
  onOpenHelp: () => void;
  historyCount: number;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onOpenHistory,
  onOpenHelp,
  historyCount,
  isGenerating,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-xs text-white font-bold">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900">DDT Analysis Engine</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Multilingual Audio & Estimate Letter Analyzer for Jira Campaign Cards
            </p>
          </div>
        </div>

        {/* Quick Actions Header Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
          <button
            onClick={onLoadSample}
            disabled={isGenerating}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
            title="Load sample case 'Baby of Priyanka' for instant preview"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Sample Case</span>
          </button>

          <button
            onClick={onOpenHistory}
            type="button"
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200 transition-all cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-indigo-600 text-white font-bold rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenHelp}
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200 transition-all cursor-pointer"
            title="View User Guide & Instructions"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
