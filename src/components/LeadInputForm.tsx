import React, { useState, useRef } from 'react';
import {
  User,
  Calendar,
  Building,
  UploadCloud,
  FileAudio,
  FileText,
  Image as ImageIcon,
  X,
  Sparkles,
  Check,
  AlertCircle,
  Play,
  Volume2,
  FileCheck,
} from 'lucide-react';
import { DDTInputForm, FilePayload } from '../types';
import { fileToFilePayload } from '../services/api';

interface LeadInputFormProps {
  form: DDTInputForm;
  onChange: (updated: Partial<DDTInputForm>) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  onReset: () => void;
}

export const LeadInputForm: React.FC<LeadInputFormProps> = ({
  form,
  onChange,
  onSubmit,
  isGenerating,
  onReset,
}) => {
  const [audioDragOver, setAudioDragOver] = useState(false);
  const [docDragOver, setDocDragOver] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const oldPicsInputRef = useRef<HTMLInputElement>(null);
  const hospitalPicsInputRef = useRef<HTMLInputElement>(null);

  // Handle Call Recording Upload
  const handleAudioUpload = async (file: File) => {
    try {
      const payload = await fileToFilePayload(file);
      onChange({ callRecording: payload });
      // Create Object URL for client-side playback preview
      const objectUrl = URL.createObjectURL(file);
      setAudioPreviewUrl(objectUrl);
    } catch (err) {
      console.error('Error processing audio file:', err);
      alert('Could not read audio file. Please try a different MP3, M4A, or WAV file.');
    }
  };

  // Handle Estimate Letter Upload
  const handleDocUpload = async (file: File) => {
    try {
      const payload = await fileToFilePayload(file);
      onChange({ estimateLetter: payload });
    } catch (err) {
      console.error('Error processing document file:', err);
      alert('Could not read estimate letter document. Please try a valid PDF or image.');
    }
  };

  // Handle Old Pics Upload
  const handleOldPicsUpload = async (files: FileList) => {
    try {
      const payloads: FilePayload[] = [];
      for (let i = 0; i < files.length; i++) {
        const p = await fileToFilePayload(files[i]);
        payloads.push(p);
      }
      onChange({ oldPics: [...form.oldPics, ...payloads] });
    } catch (err) {
      console.error('Error uploading old pics:', err);
    }
  };

  // Handle Hospital Pics Upload
  const handleHospitalPicsUpload = async (files: FileList) => {
    try {
      const payloads: FilePayload[] = [];
      for (let i = 0; i < files.length; i++) {
        const p = await fileToFilePayload(files[i]);
        payloads.push(p);
      }
      onChange({ hospitalPics: [...form.hospitalPics, ...payloads] });
    } catch (err) {
      console.error('Error uploading hospital pics:', err);
    }
  };

  const isSubmitDisabled = isGenerating || !form.patientName.trim();

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-white p-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            Intake Form & Lead Context
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Attach call recording, estimate letter, and patient metadata
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Clear Form
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="p-5 space-y-5"
      >
        {/* Core Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-indigo-600" /> Patient Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.patientName}
              onChange={(e) => onChange({ patientName: e.target.value })}
              placeholder="e.g. Baby of Priyanka / Aarav Kumar"
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all outline-none"
            />
          </div>

          {/* BD Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" /> BD Name (Business Dev)
            </label>
            <input
              type="text"
              value={form.bdName}
              onChange={(e) => onChange({ bdName: e.target.value })}
              placeholder="e.g. Rohan Sharma"
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all outline-none"
            />
          </div>

          {/* Case Manager (CM) Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-600" /> Case Manager (CM) Name
            </label>
            <input
              type="text"
              value={form.cmName}
              onChange={(e) => onChange({ cmName: e.target.value })}
              placeholder="e.g. Sumit Chaurasiya"
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-all outline-none"
            />
          </div>

          {/* Shoot Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" /> Shoot Date
            </label>
            <input
              type="date"
              value={form.shootDate}
              onChange={(e) => onChange({ shootDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 transition-all outline-none"
            />
          </div>

          {/* Shoot Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-purple-600" /> Shoot Location
            </label>
            <select
              value={form.shootLocation}
              onChange={(e) => onChange({ shootLocation: e.target.value as 'Hospital' | 'Home' })}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 transition-all outline-none"
            >
              <option value="Hospital">Hospital</option>
              <option value="Home">Home</option>
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lead Source</label>
            <select
              value={form.source}
              onChange={(e) => onChange({ source: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 transition-all outline-none"
            >
              <option value="Outbound">Outbound Call</option>
              <option value="Inbound">Inbound Inquiry</option>
              <option value="Partner Referral">Partner Referral</option>
            </select>
          </div>
        </div>

        {/* Media Attachments Section */}
        <div className="space-y-4 pt-3 border-t border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Primary Document & Recording Attachments
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. DDT Call Recording Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileAudio className="w-4 h-4 text-emerald-600" />
                  DDT Call Recording
                </label>
                <span className="text-[10px] text-slate-400">MP3, M4A, WAV, MP4</span>
              </div>

              {!form.callRecording ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setAudioDragOver(true);
                  }}
                  onDragLeave={() => setAudioDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setAudioDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleAudioUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => audioInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    audioDragOver
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-slate-50/60 hover:border-indigo-400 hover:bg-slate-100/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={audioInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleAudioUpload(e.target.files[0]);
                      }
                    }}
                    accept="audio/*,video/mp4,video/m4a,.m4a,.mp3,.wav,.aac,.ogg,.3gp"
                    className="hidden"
                  />
                  <UploadCloud className="w-7 h-7 text-indigo-500 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">
                    Drop DDT Call Recording
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    MP3, M4A, WAV audio or video recording
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {form.callRecording.fileName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {(form.callRecording.fileSize / (1024 * 1024)).toFixed(2)} MB • {form.callRecording.fileType}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onChange({ callRecording: null });
                        setAudioPreviewUrl(null);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* HTML5 Audio Player Preview if available */}
                  {audioPreviewUrl && (
                    <div className="pt-1">
                      <audio controls src={audioPreviewUrl} className="w-full h-8 rounded text-xs" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Estimate Letter Attachment Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Hospital Estimate Letter
                </label>
                <span className="text-[10px] text-slate-400">PDF, JPG, PNG</span>
              </div>

              {!form.estimateLetter ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDocDragOver(true);
                  }}
                  onDragLeave={() => setDocDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDocDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleDocUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => docInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    docDragOver
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-slate-50/60 hover:border-indigo-400 hover:bg-slate-100/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={docInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleDocUpload(e.target.files[0]);
                      }
                    }}
                    accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                  />
                  <UploadCloud className="w-7 h-7 text-indigo-500 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">
                    Drop Estimate Letter
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Upload official hospital estimate (PDF/Image)
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2 truncate">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {form.estimateLetter.fileName}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {(form.estimateLetter.fileSize / (1024 * 1024)).toFixed(2)} MB • {form.estimateLetter.fileType}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ estimateLetter: null })}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Secondary Photos Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Old Patient Photos */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-700 font-bold flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                  Old Patient Photos ({form.oldPics.length})
                </label>
                <button
                  type="button"
                  onClick={() => oldPicsInputRef.current?.click()}
                  className="text-[11px] text-indigo-600 hover:underline font-medium cursor-pointer"
                >
                  + Add Photos
                </button>
              </div>
              <input
                type="file"
                ref={oldPicsInputRef}
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleOldPicsUpload(e.target.files)}
                className="hidden"
              />
              {form.oldPics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {form.oldPics.map((pic, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[11px] text-slate-700 border border-slate-200 font-medium"
                    >
                      {pic.fileName.length > 15 ? pic.fileName.substring(0, 15) + '...' : pic.fileName}
                      <button
                        type="button"
                        onClick={() =>
                          onChange({ oldPics: form.oldPics.filter((_, i) => i !== idx) })
                        }
                        className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Hospital / NICU Photos */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-700 font-bold flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                  Hospital / NICU Photos ({form.hospitalPics.length})
                </label>
                <button
                  type="button"
                  onClick={() => hospitalPicsInputRef.current?.click()}
                  className="text-[11px] text-indigo-600 hover:underline font-medium cursor-pointer"
                >
                  + Add Photos
                </button>
              </div>
              <input
                type="file"
                ref={hospitalPicsInputRef}
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && handleHospitalPicsUpload(e.target.files)}
                className="hidden"
              />
              {form.hospitalPics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {form.hospitalPics.map((pic, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[11px] text-slate-700 border border-slate-200 font-medium"
                    >
                      {pic.fileName.length > 15 ? pic.fileName.substring(0, 15) + '...' : pic.fileName}
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            hospitalPics: form.hospitalPics.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Context Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Additional Case Notes / Campaigner Context (Optional)
          </label>
          <textarea
            rows={2}
            value={form.additionalNotes}
            onChange={(e) => onChange({ additionalNotes: e.target.value })}
            placeholder="e.g. Campaigner confirmed Medibuddy. Mother & father available for shoot..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 transition-all outline-none resize-none"
          />
        </div>

        {/* Submit Action Button */}
        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer ${
              isSubmitDisabled
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 active:scale-[0.99]'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Call Recording & Documents...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate Case Summary</span>
              </>
            )}
          </button>
          {!form.patientName.trim() && (
            <p className="text-[11px] text-amber-600 text-center mt-2 flex items-center justify-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3 text-amber-500" /> Enter Patient Name to generate summary
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
