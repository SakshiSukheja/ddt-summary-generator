import React, { useState } from 'react';
import { Copy, Check, Download, Edit3, Eye, FileText, Share2, Sparkles } from 'lucide-react';
import { downloadTextFile } from '../services/api';

interface JiraSummaryViewProps {
  jiraCardText: string;
  patientName: string;
  onUpdateJiraText: (updated: string) => void;
}

export const JiraSummaryView: React.FC<JiraSummaryViewProps> = ({
  jiraCardText,
  patientName,
  onUpdateJiraText,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jiraCardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    const filename = `DDT_Jira_Card_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    downloadTextFile(jiraCardText, filename);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden flex flex-col h-full">
      {/* Header bar with terminal dots and controls */}
      <div className="bg-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="ml-3 text-xs font-mono text-slate-300 font-medium">Jira_Summary_Template.txt</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              isEditing
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {isEditing ? (
              <>
                <Eye className="w-3.5 h-3.5" /> Preview Mode
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" /> Edit Text
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-600 transition-colors cursor-pointer"
            title="Download formatted text file"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" /> Download
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all shadow-sm cursor-pointer ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-900/30'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/30'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-100" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy to Clipboard
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Code View Content Box */}
      <div className="p-6 flex-1 bg-slate-900 min-h-[460px]">
        {isEditing ? (
          <textarea
            value={jiraCardText}
            onChange={(e) => onUpdateJiraText(e.target.value)}
            className="w-full h-full min-h-[460px] bg-slate-950 text-slate-200 font-mono text-xs sm:text-sm p-4 rounded-lg border border-indigo-500/40 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
          />
        ) : (
          <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 text-slate-300 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-all overflow-x-auto selection:bg-indigo-500/30 selection:text-white">
            {jiraCardText}
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="bg-slate-800/60 p-2.5 border-t border-slate-800 text-center">
        <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Copy & paste directly into Jira description box. All headers and metadata tags will be preserved.</span>
        </p>
      </div>
    </div>
  );
};
