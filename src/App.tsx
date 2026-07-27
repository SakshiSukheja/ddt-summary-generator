import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  LayoutDashboard,
  Volume2,
  Copy,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Header } from './components/Header';
import { LeadInputForm } from './components/LeadInputForm';
import { JiraSummaryView } from './components/JiraSummaryView';
import { StructuredDetailsCard } from './components/StructuredDetailsCard';
import { AudioTranscriptView } from './components/AudioTranscriptView';
import { CaseHistoryDrawer } from './components/CaseHistoryDrawer';
import { HelpModal } from './components/HelpModal';

import { DDTInputForm, GeneratedCaseSummary, CaseHistoryItem } from './types';
import {
  generateCaseSummary,
  getStoredCaseHistory,
  saveCaseToHistory,
  deleteCaseFromHistory,
  clearAllCaseHistory,
} from './services/api';
import {
  SAMPLE_INPUT_BABY_PRIYANKA,
  SAMPLE_GENERATED_SUMMARY_BABY_PRIYANKA,
} from './data/sampleCases';

export default function App() {
  const [form, setForm] = useState<DDTInputForm>({
    patientName: '',
    bdName: '',
    shootDate: new Date().toISOString().split('T')[0],
    shootLocation: 'Hospital',
    source: 'Outbound Medical',
    callRecording: null,
    estimateLetter: null,
    oldPics: [],
    hospitalPics: [],
    additionalNotes: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<GeneratedCaseSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'jira' | 'structured' | 'transcript'>('jira');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History & Help Modals
  const [history, setHistory] = useState<CaseHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    // Load stored history on mount
    const savedHistory = getStoredCaseHistory();
    setHistory(savedHistory);
  }, []);

  // Update Form State Partial
  const handleFormChange = (updated: Partial<DDTInputForm>) => {
    setForm((prev) => ({ ...prev, ...updated }));
  };

  // Reset Form
  const handleResetForm = () => {
    setForm({
      patientName: '',
      bdName: '',
      shootDate: new Date().toISOString().split('T')[0],
      shootLocation: 'Hospital',
      source: 'Outbound Medical',
      callRecording: null,
      estimateLetter: null,
      oldPics: [],
      hospitalPics: [],
      additionalNotes: '',
    });
    setErrorMessage(null);
  };

  // Load Preset Sample Case ("Baby of Priyanka")
  const handleLoadSample = () => {
    setForm(SAMPLE_INPUT_BABY_PRIYANKA);
    setGeneratedSummary(SAMPLE_GENERATED_SUMMARY_BABY_PRIYANKA);
    setActiveTab('jira');
    setErrorMessage(null);

    const updatedHistory = saveCaseToHistory(SAMPLE_GENERATED_SUMMARY_BABY_PRIYANKA);
    setHistory(updatedHistory);
  };

  // Submit Form to Gemini AI Backend
  const handleSubmit = async () => {
    if (!form.patientName.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const summary = await generateCaseSummary(form);
      setGeneratedSummary(summary);
      setActiveTab('jira');

      // Save to history
      const updatedHistory = saveCaseToHistory(summary);
      setHistory(updatedHistory);
    } catch (err: any) {
      console.error('Error generating summary:', err);
      setErrorMessage(
        err.message || 'Failed to generate due diligence summary. Please check your network and API key.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Update Jira Card Text when edited manually
  const handleUpdateJiraText = (newText: string) => {
    if (!generatedSummary) return;
    const updatedSummary = { ...generatedSummary, jiraCardText: newText };
    setGeneratedSummary(updatedSummary);
    const updatedHistory = saveCaseToHistory(updatedSummary);
    setHistory(updatedHistory);
  };

  // Select case from history
  const handleSelectCaseFromHistory = (summary: GeneratedCaseSummary) => {
    setGeneratedSummary(summary);
    setForm({
      patientName: summary.patientName || '',
      bdName: summary.bdName || '',
      shootDate: summary.shootDate || new Date().toISOString().split('T')[0],
      shootLocation: 'Hospital',
      source: 'Outbound',
      callRecording: null,
      estimateLetter: null,
      oldPics: [],
      hospitalPics: [],
      additionalNotes: '',
    });
    setActiveTab('jira');
  };

  // Delete case from history
  const handleDeleteHistoryCase = (id: string) => {
    const updated = deleteCaseFromHistory(id);
    setHistory(updated);
  };

  // Clear all history
  const handleClearAllHistory = () => {
    clearAllCaseHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-500/20">
      {/* Top Navigation Header */}
      <Header
        onLoadSample={handleLoadSample}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        historyCount={history.length}
        isGenerating={isGenerating}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification Banner if any */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 flex items-start space-x-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-rose-900">Generation Error</h4>
              <p className="mt-0.5 text-rose-700 leading-relaxed">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-800 text-xs font-semibold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form & Media Intake (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <LeadInputForm
              form={form}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              isGenerating={isGenerating}
              onReset={handleResetForm}
            />
          </div>

          {/* Right Column: AI Results & Jira Card Workspace (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {generatedSummary ? (
              <div className="space-y-4">
                {/* Result View Tabs Header */}
                <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex items-center justify-between gap-2 shadow-sm">
                  <div className="flex items-center space-x-1.5 overflow-x-auto w-full">
                    <button
                      type="button"
                      onClick={() => setActiveTab('jira')}
                      className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'jira'
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Jira Card Text</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('structured')}
                      className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'structured'
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Case Breakdown</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('transcript')}
                      className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeTab === 'transcript'
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Call Transcript</span>
                    </button>
                  </div>
                </div>

                {/* Tab 1: Jira Text Output */}
                {activeTab === 'jira' && (
                  <JiraSummaryView
                    jiraCardText={generatedSummary.jiraCardText}
                    patientName={generatedSummary.patientName}
                    onUpdateJiraText={handleUpdateJiraText}
                  />
                )}

                {/* Tab 2: Structured Case Dashboard */}
                {activeTab === 'structured' && (
                  <StructuredDetailsCard
                    details={generatedSummary.parsedDetails}
                    authenticityCheck={generatedSummary.authenticityCheck}
                  />
                )}

                {/* Tab 3: Call Transcript & Audio Analysis */}
                {activeTab === 'transcript' && (
                  <AudioTranscriptView
                    transcriptSummary={generatedSummary.callTranscriptSummary}
                    patientName={generatedSummary.patientName}
                  />
                )}
              </div>
            ) : (
              /* Empty Placeholder State before submitting */
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4 shadow-sm min-h-[520px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-8 h-8 text-indigo-600" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Ready to Generate Due Diligence Case Summary
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Attach a DDT call recording in Hindi, English, or any Indian regional language along with the hospital estimate letter. AI will extract all details and format them directly for Jira.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleLoadSample}
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 shadow-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Try Sample Case: "Baby of Priyanka"</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 px-6 py-3.5 mt-auto flex flex-wrap justify-between items-center text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>DDT Analysis Engine • Multimodal Multilingual AI</span>
        </div>
      </footer>

      {/* Side History Drawer */}
      <CaseHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectCase={handleSelectCaseFromHistory}
        onDeleteCase={handleDeleteHistoryCase}
        onClearAll={handleClearAllHistory}
      />

      {/* User Guide Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
