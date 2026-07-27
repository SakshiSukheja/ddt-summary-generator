import { FilePayload } from '../types';
import { fileToFilePayload } from '../services/api';

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.getChannelData(0);
  const bufferLength = samples.length;
  const wavBuffer = new ArrayBuffer(44 + bufferLength * 2);
  const view = new DataView(wavBuffer);

  /* RIFF header */
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + bufferLength * 2, true);
  writeString(view, 8, 'WAVE');
  
  /* fmt chunk */
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample

  /* data chunk */
  writeString(view, 36, 'data');
  view.setUint32(40, bufferLength * 2, true);

  // Convert Float32 [-1, 1] to Int16 PCM
  let offset = 44;
  for (let i = 0; i < bufferLength; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

export interface CompressOptions {
  startTimeSec?: number;
  endTimeSec?: number;
  targetMaxMB?: number; // e.g. 2.8 MB
}

export async function compressAudioForVercel(
  file: File,
  options: CompressOptions = {},
  onProgress?: (msg: string) => void
): Promise<{ payload: FilePayload; originalMB: number; newMB: number; durationSec: number }> {
  const targetMaxMB = options.targetMaxMB || 2.8;
  const originalMB = file.size / (1024 * 1024);

  onProgress?.('Reading audio file into browser memory...');
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.('Decoding audio track...');
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioCtx();
  const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const fullDuration = decodedBuffer.duration;
  const start = Math.max(0, options.startTimeSec || 0);
  const end = Math.min(fullDuration, options.endTimeSec || fullDuration);
  const durationToProcess = end - start;

  onProgress?.(`Processing ${Math.round(durationToProcess)}s audio clip...`);

  // Calculate required sample rate to fit within targetMaxMB
  // maxBytes = targetMaxMB * 1024 * 1024
  // maxBytes = sampleRate * durationToProcess * 2 + 44
  const maxBytes = targetMaxMB * 1024 * 1024 - 100;
  let sampleRate = Math.floor(maxBytes / (durationToProcess * 2));

  // Clamp sample rate between 8,000 Hz (telephone standard) and 16,000 Hz (speech recognition standard)
  sampleRate = Math.min(16000, Math.max(8000, sampleRate));

  onProgress?.(`Resampling speech to ${sampleRate} Hz Mono for Vercel...`);

  // Render to mono channel with OfflineAudioContext
  const offlineCtx = new OfflineAudioContext(1, Math.ceil(durationToProcess * sampleRate), sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = decodedBuffer;

  source.connect(offlineCtx.destination);
  source.start(0, start, durationToProcess);

  const renderedBuffer = await offlineCtx.startRendering();

  onProgress?.('Encoding lightweight mono WAV...');
  const wavBlob = audioBufferToWavBlob(renderedBuffer);
  const compressedFile = new File([wavBlob], file.name.replace(/\.[^/.]+$/, '') + '_compressed.wav', {
    type: 'audio/wav',
  });

  const newMB = compressedFile.size / (1024 * 1024);
  onProgress?.('Preparing payload for AI analysis...');
  const payload = await fileToFilePayload(compressedFile);

  return {
    payload,
    originalMB,
    newMB,
    durationSec: durationToProcess,
  };
}
