import { DDTInputForm, GeneratedCaseSummary, CaseHistoryItem, FilePayload } from '../types';

export async function generateCaseSummary(input: DDTInputForm): Promise<GeneratedCaseSummary> {
  const response = await fetch('/api/generate-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned error status ${response.status}`);
  }

  const data = await response.json();
  if (!data.success || !data.caseSummary) {
    throw new Error('Invalid response received from server.');
  }

  return data.caseSummary;
}

export function inferMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  switch (ext) {
    case 'mp3': return 'audio/mp3';
    case 'm4a': return 'audio/mp4';
    case 'wav': return 'audio/wav';
    case 'aac': return 'audio/aac';
    case 'ogg': return 'audio/ogg';
    case '3gp': return 'audio/3gpp';
    case 'mp4': return 'audio/mp4';
    case 'webm': return 'audio/webm';
    case 'pdf': return 'application/pdf';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
}

// Convert HTML File object to FilePayload (Base64)
export function fileToFilePayload(file: File): Promise<FilePayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const fileType = file.type && file.type !== 'application/octet-stream' ? file.type : inferMimeType(file.name);
      resolve({
        fileName: file.name,
        fileType,
        fileSize: file.size,
        base64: reader.result as string,
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Local Storage History Management
const HISTORY_STORAGE_KEY = 'ddt_case_summaries_history_v1';

export function getStoredCaseHistory(): CaseHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load stored history:', err);
    return [];
  }
}

export function saveCaseToHistory(summary: GeneratedCaseSummary): CaseHistoryItem[] {
  try {
    const existing = getStoredCaseHistory();
    const newItem: CaseHistoryItem = {
      id: summary.id,
      createdAt: summary.createdAt,
      patientName: summary.patientName,
      bdName: summary.bdName,
      shootDate: summary.shootDate,
      summary,
    };
    // Keep max 30 recent items
    const updated = [newItem, ...existing.filter((item) => item.id !== summary.id)].slice(0, 30);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save to history:', err);
    return [];
  }
}

export function deleteCaseFromHistory(id: string): CaseHistoryItem[] {
  try {
    const existing = getStoredCaseHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete history item:', err);
    return [];
  }
}

export function clearAllCaseHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}

export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
