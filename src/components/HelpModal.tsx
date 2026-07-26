import React from 'react';
import { X, CheckCircle2, FileAudio, FileText, Sparkles, HelpCircle, ShieldCheck } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">DDT Due Diligence Engine Guide</h2>
              <p className="text-xs text-slate-500">
                How to generate Jira Campaign Cards from Multilingual Calls & Estimate Letters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-indigo-700 text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
              Enter Patient & Campaign Metadata
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Fill in Patient Name, Business Development (BD) Name, Case Manager (CM) Name, Shoot Date, and Shoot Location.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-emerald-700 text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">2</span>
              Attach Call Recording & Hospital Estimate Letter
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Upload your DDT call recording audio/video. The AI natively supports <strong>Hindi, Marathi, Gujarati, English, Hinglish</strong> and other Indian languages in <code>.mp3</code>, <code>.m4a</code>, <code>.wav</code>, <code>.aac</code>, <code>.mp4</code>, or <code>.3gp</code> formats.
            </p>
            <p className="text-slate-700 leading-relaxed">
              Upload the Hospital Estimate Letter in <code>.pdf</code>, <code>.jpg</code>, or <code>.png</code> format.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-blue-700 text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
              AI Processing & Instant Jira Copying
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Click <strong>"Generate Case Summary"</strong>. Gemini 3.6 Flash will extract clinical diagnoses, financial background, contact details, missing documents, and generate the exact Jira Card Description ready for one-click copy!
            </p>
          </div>

          {/* Supported Formats */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold block text-[11px] mb-1 flex items-center gap-1">
                <FileAudio className="w-3.5 h-3.5 text-emerald-600" /> Call Recording Formats
              </span>
              <p className="text-slate-700 text-[11px]">.mp3, .m4a, .wav, .aac, .mp4, .webm, .3gp</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold block text-[11px] mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-600" /> Estimate Letter Formats
              </span>
              <p className="text-slate-700 text-[11px]">.pdf, .jpg, .jpeg, .png, .webp</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Got It, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
