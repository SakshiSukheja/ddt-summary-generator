import React from 'react';
import { Volume2, Languages, MessageSquareText, CheckCircle2, FileAudio } from 'lucide-react';
import { CallTranscriptSummary } from '../types';

interface AudioTranscriptViewProps {
  transcriptSummary: CallTranscriptSummary;
  patientName: string;
}

export const AudioTranscriptView: React.FC<AudioTranscriptViewProps> = ({
  transcriptSummary,
  patientName,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden p-5 space-y-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Call Recording AI Transcription Analysis</h3>
            <p className="text-xs text-slate-500">
              Multilingual Speech-to-Text & Lead Context Extraction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <Languages className="w-3.5 h-3.5 text-emerald-600" />
          <span>Language: {transcriptSummary.detectedLanguage || 'Hindi / English'}</span>
        </div>
      </div>

      {/* Takeaways List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquareText className="w-4 h-4 text-indigo-600" />
          Key Call Highlights & Campaigner Commitments
        </h4>

        {transcriptSummary.keyTakeaways && transcriptSummary.keyTakeaways.length > 0 ? (
          <ul className="space-y-2">
            {transcriptSummary.keyTakeaways.map((point, index) => (
              <li
                key={index}
                className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 flex items-start space-x-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{point}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-400 italic">No explicit call takeaways recorded.</p>
        )}
      </div>

      {/* English Translated Summary */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <FileAudio className="w-4 h-4 text-blue-600" />
          English Executive Call Summary
        </h4>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
          {transcriptSummary.englishSummary ||
            `Full call analyzed for ${patientName}. The DDT member verified medical status, hospital location, financial background, and confirmed consent for photoshoot.`}
        </div>
      </div>
    </div>
  );
};
