import React, { useState } from 'react';
import {
  X,
  Search,
  Trash2,
  Calendar,
  User,
  Copy,
  Check,
  RotateCcw,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CaseHistoryItem, GeneratedCaseSummary } from '../types';

interface CaseHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CaseHistoryItem[];
  onSelectCase: (summary: GeneratedCaseSummary) => void;
  onDeleteCase: (id: string) => void;
  onClearAll: () => void;
}

export const CaseHistoryDrawer: React.FC<CaseHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectCase,
  onDeleteCase,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter(
    (item) =>
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bdName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shootDate.includes(searchTerm)
  );

  const handleCopyText = async (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white border-l border-slate-200 text-slate-900 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Past Case Summaries</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name, BD, date..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {history.length > 0 && (
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Showing {filteredHistory.length} of {history.length} cases</span>
              <button
                onClick={onClearAll}
                className="text-rose-600 hover:underline cursor-pointer text-[11px] font-semibold"
              >
                Clear History
              </button>
            </div>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No past cases found.</p>
              <p className="text-[11px] text-slate-400">
                Generated case summaries will automatically save here.
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectCase(item.summary);
                  onClose();
                }}
                className="bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 hover:border-indigo-300 rounded-xl p-3.5 cursor-pointer transition-all space-y-2.5 group shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">
                      {item.patientName}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-blue-600" /> BD: {item.bdName || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-600" /> {item.shootDate}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCase(item.id);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-200 transition-colors"
                    title="Delete case"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200">
                  <span className="text-slate-400 text-[10px]">
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleCopyText(item.id, item.summary.jiraCardText, e)}
                      className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-semibold flex items-center gap-1 border border-indigo-200"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-indigo-600" /> Copy Jira
                        </>
                      )}
                    </button>

                    <span className="text-indigo-600 group-hover:translate-x-0.5 transition-transform font-bold">
                      View →
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
