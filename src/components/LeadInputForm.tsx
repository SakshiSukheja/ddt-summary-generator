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
  AlertCircle,
  Volume2,
  FileCheck,
  Plus,
  Trash2,
  Zap,
  Loader2,
} from 'lucide-react';
import { DDTInputForm, FilePayload } from '../types';
import { fileToFilePayload } from '../services/api';
import { compressAudioForVercel } from '../utils/audioCompressor.ts';

const DEFAULT_BD_LIST = [
  'Rohan Sharma',
  'Sumit Chaurasiya',
  'Priya Verma',
  'Amit Kumar',
  'Anjali Singh',
  'Rahul Mehta',
  'Vikram Patel',
];

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
  const [isCompressingAudio, setIsCompressingAudio] = useState(false);
  const [compressProgressMsg, setCompressProgressMsg] = useState('');
  const [compressedInfoBadge, setCompressedInfoBadge] = useState<string | null>(null);

  // BD List state & manager modal
  const [bdList, setBdList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ddt_bd_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading stored BD list:', e);
    }
    return DEFAULT_BD_LIST;
  });

  const [isBdManagerOpen, setIsBdManagerOpen] = useState(false);
  const [newBdInput, setNewBdInput] = useState('');
  const [isCustomBdMode, setIsCustomBdMode] = useState(false);

  // Shoot Date mode state: 'single' | 'range' | 'custom'
  const [dateMode, setDateMode] = useState<'single' | 'range' | 'custom'>(() => {
    if (!form.shootDate) return 'single';
    if (form.shootDate.includes(' to ')) return 'range';
    if (form.shootDate.length > 10 || !/^\d{4}-\d{2}-\d{2}$/.test(form.shootDate)) return 'custom';
    return 'single';
  });

  const [startDate, setStartDate] = useState(() => {
    if (form.shootDate && form.shootDate.includes(' to ')) {
      return form.shootDate.split(' to ')[0];
    }
    return /^\d{4}-\d{2}-\d{2}$/.test(form.shootDate) ? form.shootDate : new Date().toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    if (form.shootDate && form.shootDate.includes(' to ')) {
      return form.shootDate.split(' to ')[1];
    }
    return new Date().toISOString().split('T')[0];
  });

  const audioInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const oldPicsInputRef = useRef<HTMLInputElement>(null);
  const hospitalPicsInputRef = useRef<HTMLInputElement>(null);

  // Save BD List
  const saveBdList = (newList: string[]) => {
    setBdList(newList);
    try {
      localStorage.setItem('ddt_bd_list', JSON.stringify(newList));
    } catch (e) {
      console.error('Error saving BD list:', e);
    }
  };

  const handleAddBd = () => {
    const trimmed = newBdInput.trim();
    if (!trimmed) return;
    if (bdList.includes(trimmed)) {
      alert('This BD Name already exists in the list.');
      return;
    }
    const updated = [...bdList, trimmed];
    saveBdList(updated);
    onChange({ bdName: trimmed });
    setNewBdInput('');
  };

  const handleDeleteBd = (nameToRemove: string) => {
    const updated = bdList.filter((n) => n !== nameToRemove);
    saveBdList(updated);
    if (form.bdName === nameToRemove) {
      onChange({ bdName: updated[0] || '' });
    }
  };

  // Handle Call Recording Upload
  const MAX_RECOMMENDED_BYTES = 3.2 * 1024 * 1024; // 3.2MB binary = ~4.4MB Base64

  const handleAudioUpload = async (file: File) => {
    setCompressedInfoBadge(null);

    // If file is larger than 2.8MB, automatically compress/resample it in browser
    if (file.size > 2.8 * 1024 * 1024) {
      setIsCompressingAudio(true);
      setCompressProgressMsg('Initializing Web Audio Engine...');
      try {
        const result = await compressAudioForVercel(
          file,
          { targetMaxMB: 2.8 },
          (msg) => setCompressProgressMsg(msg)
        );

        onChange({ callRecording: result.payload });
        setCompressedInfoBadge(
          `⚡ Auto-compressed in browser from ${result.originalMB.toFixed(1)}MB down to ${result.newMB.toFixed(2)}MB`
        );

        // Preview generated compressed audio
        setAudioPreviewUrl(result.payload.base64);
      } catch (err) {
        console.error('Error auto-compressing audio file:', err);
        // Fallback to normal upload
        try {
          const payload = await fileToFilePayload(file);
          onChange({ callRecording: payload });
          const objectUrl = URL.createObjectURL(file);
          setAudioPreviewUrl(objectUrl);
        } catch (e) {
          alert('Could not read audio file. Please try an MP3, WAV, or M4A file.');
        }
      } finally {
        setIsCompressingAudio(false);
      }
      return;
    }

    try {
      const payload = await fileToFilePayload(file);
      onChange({ callRecording: payload });
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

  // Calculate total payload size
  const totalFileBytes =
    (form.callRecording?.fileSize || 0) +
    (form.estimateLetter?.fileSize || 0) +
    form.oldPics.reduce((sum, f) => sum + f.fileSize, 0) +
    form.hospitalPics.reduce((sum, f) => sum + f.fileSize, 0);

  const totalFileMB = (totalFileBytes / (1024 * 1024)).toFixed(2);
  const isPayloadTooLarge = totalFileBytes > MAX_RECOMMENDED_BYTES;

  const isSubmitDisabled = isGenerating || !form.patientName.trim() || isPayloadTooLarge;

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

          {/* BD Name Dropdown & Quick Manager */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" /> BD Name (Business Dev / Case Manager)
              </label>
              <button
                type="button"
                onClick={() => setIsBdManagerOpen(true)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Manage List
              </button>
            </div>

            {!isCustomBdMode ? (
              <select
                value={bdList.includes(form.bdName) ? form.bdName : (form.bdName ? 'CUSTOM' : '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'MANAGE') {
                    setIsBdManagerOpen(true);
                  } else if (val === 'CUSTOM') {
                    setIsCustomBdMode(true);
                  } else {
                    onChange({ bdName: val });
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 transition-all outline-none"
              >
                <option value="">-- Select BD Name --</option>
                {bdList.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                {form.bdName && !bdList.includes(form.bdName) && (
                  <option value="CUSTOM">{form.bdName} (Custom)</option>
                )}
                <option value="CUSTOM">✏️ Enter Custom Name...</option>
                <option value="MANAGE">⚙️ + Add / Edit BD List...</option>
              </select>
            ) : (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={form.bdName}
                  onChange={(e) => onChange({ bdName: e.target.value })}
                  placeholder="Type custom BD Name..."
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomBdMode(false)}
                  className="px-2.5 py-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Dropdown
                </button>
              </div>
            )}
          </div>

          {/* Shoot Date (Single Date, Date Range, or Custom Text) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" /> Shoot Date
              </label>
              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-md text-[10px] font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setDateMode('single');
                    const val = startDate || new Date().toISOString().split('T')[0];
                    onChange({ shootDate: val });
                  }}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    dateMode === 'single'
                      ? 'bg-white text-slate-800 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Single Date
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateMode('range');
                    const s = startDate || new Date().toISOString().split('T')[0];
                    const e = endDate || s;
                    onChange({ shootDate: `${s} to ${e}` });
                  }}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    dateMode === 'range'
                      ? 'bg-white text-slate-800 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Date Range
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateMode('custom');
                  }}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    dateMode === 'custom'
                      ? 'bg-white text-slate-800 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {dateMode === 'single' && (
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setStartDate(val);
                  onChange({ shootDate: val });
                }}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 transition-all outline-none"
              />
            )}

            {dateMode === 'range' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">Start Date</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStartDate(val);
                      const end = endDate < val ? val : endDate;
                      if (endDate < val) setEndDate(val);
                      onChange({ shootDate: `${val} to ${end}` });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 transition-all outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-medium">End Date</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEndDate(val);
                      onChange({ shootDate: `${startDate} to ${val}` });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 transition-all outline-none"
                  />
                </div>
              </div>
            )}

            {dateMode === 'custom' && (
              <input
                type="text"
                value={form.shootDate}
                onChange={(e) => onChange({ shootDate: e.target.value })}
                placeholder="e.g. 26th - 28th July 2026 or Next Week"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 transition-all outline-none"
              />
            )}
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

          {/* Lead Source */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Lead Source</label>
            <select
              value={form.source}
              onChange={(e) => onChange({ source: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm text-slate-900 transition-all outline-none"
            >
              <option value="Outbound Medical">Outbound Medical</option>
              <option value="Inbound Medical">Inbound Medical</option>
              <option value="No component">No component</option>
              <option value="DDT medical">DDT medical</option>
              <option value="NGO">NGO</option>
              <option value="Non Medical">Non Medical</option>
              <option value="SMA">SMA</option>
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
                <span className="text-[10px] text-amber-600 font-medium">Max ~3.2MB (Vercel Serverless)</span>
              </div>

              {isCompressingAudio ? (
                <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Auto-Compressing Audio for Vercel...</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">{compressProgressMsg || 'Resampling speech track...'}</p>
                  </div>
                </div>
              ) : !form.callRecording ? (
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
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*,video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleAudioUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-slate-700">
                    Drop DDT Call Recording
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    MP3, M4A, WAV, 3GP (Large files auto-compressed in browser)
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {form.callRecording.fileName}
                        </p>
                        <p className="text-[10px] text-emerald-700">
                          {(form.callRecording.fileSize / (1024 * 1024)).toFixed(2)} MB • Ready for Analysis
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onChange({ callRecording: null });
                        setAudioPreviewUrl(null);
                        setCompressedInfoBadge(null);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-white/50 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {compressedInfoBadge && (
                    <div className="px-2 py-1 bg-emerald-100 border border-emerald-300 rounded text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{compressedInfoBadge}</span>
                    </div>
                  )}

                  {audioPreviewUrl && (
                    <audio controls src={audioPreviewUrl} className="w-full h-8 mt-1 rounded" />
                  )}
                </div>
              )}
            </div>

            {/* 2. Hospital Estimate Letter Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Hospital Estimate Letter
                </label>
                <span className="text-[10px] text-slate-400">PDF / Image</span>
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
                      ? 'border-indigo-500 bg-indigo-50/50'
                      : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={docInputRef}
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleDocUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-slate-700">
                    Drop Hospital Estimate Letter
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    PDF document or high-res photo
                  </p>
                </div>
              ) : (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {form.estimateLetter.fileName}
                      </p>
                      <p className="text-[10px] text-indigo-700">
                        {(form.estimateLetter.fileSize / 1024).toFixed(1)} KB • Attached
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ estimateLetter: null })}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-white/50 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Secondary Photos (Old Patient Pics & Hospital Shoot Pics) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Old Patient Photos */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  Old Patient Photos (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => oldPicsInputRef.current?.click()}
                  className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  + Add Photos
                </button>
              </div>
              <input
                ref={oldPicsInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) handleOldPicsUpload(e.target.files);
                }}
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
                          onChange({
                            oldPics: form.oldPics.filter((_, i) => i !== idx),
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

            {/* Hospital Shoot Photos */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                  Hospital Shoot Photos (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => hospitalPicsInputRef.current?.click()}
                  className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  + Add Photos
                </button>
              </div>
              <input
                ref={hospitalPicsInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) handleHospitalPicsUpload(e.target.files);
                }}
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
          {isPayloadTooLarge && (
            <div className="p-3 mb-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Total file size ({totalFileMB} MB) exceeds Vercel's limit (3.2 MB max)</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Vercel serverless functions cap request bodies at 4.5 MB (~3.2 MB binary files after base64 encoding). Please upload a smaller audio clip (under 3.2 MB) or compress the MP3 file before submitting.
                </p>
              </div>
            </div>
          )}

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

      {/* BD List Manager Modal */}
      {isBdManagerOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Manage BD / Case Managers List</h3>
                  <p className="text-xs text-slate-500">Add or remove names to customize the dropdown</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBdManagerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add New BD Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newBdInput}
                onChange={(e) => setNewBdInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddBd();
                  }
                }}
                placeholder="Enter new BD Name (e.g. Ramesh Kumar)"
                className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
              />
              <button
                type="button"
                onClick={handleAddBd}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Existing BD List */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Active BD Names ({bdList.length})
              </span>
              {bdList.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors text-xs text-slate-800"
                >
                  <span className="font-medium">{name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onChange({ bdName: name });
                        setIsBdManagerOpen(false);
                      }}
                      className="px-2 py-0.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-[11px] font-semibold cursor-pointer"
                    >
                      Select
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBd(name)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="Remove BD Name"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset BD list back to defaults?')) {
                    saveBdList(DEFAULT_BD_LIST);
                  }
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                onClick={() => setIsBdManagerOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
