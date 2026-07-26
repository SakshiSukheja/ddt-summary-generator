import { GoogleGenAI } from '@google/genai';
import { DDTInputForm, GeneratedCaseSummary, CaseHistoryItem, FilePayload } from '../types';

// Read API Key from environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateCaseSummary(input: DDTInputForm): Promise<GeneratedCaseSummary> {
  try {
    if (!API_KEY) {
      throw new Error('Missing Gemini API Key. Please configure VITE_GEMINI_API_KEY in environment variables.');
    }

    const contents: any[] = [];

    // Attach call recording audio if available
    if (input.audioFile?.base64) {
      const base64Data = input.audioFile.base64.split(',')[1] || input.audioFile.base64;
      contents.push({
        inlineData: {
          mimeType: input.audioFile.fileType,
          data: base64Data,
        },
      });
    }

    // Attach estimate letter document if available
    if (input.estimateFile?.base64) {
      const base64Data = input.estimateFile.base64.split(',')[1] || input.estimateFile.base64;
      contents.push({
        inlineData: {
          mimeType: input.estimateFile.fileType,
          data: base64Data,
        },
      });
    }

    // Add prompt instructions for Gemini
    const prompt = `
    Analyze the uploaded files for patient ${input.patientName} (BD: ${input.bdName}, Shoot Date: ${input.shootDate}).
    Translate any Indian regional language audio into English and extract details into this exact Jira summary format:

    Shoot Date:- ${input.shootDate} Confirmed with the campaigner
    BD Name: ${input.bdName}

    Shoot will be done at the Hospital.

    DDT Review: [Extract diagnosis from audio/estimate]

    Shoot Note: [Confirmed with family regarding shoot availability]

    Dear Team,

    Please find the details of the lead being referred for Marketing :

    PATIENT’S DETAILS
     
    Patient name: ${input.patientName}
    Patient relatives: [Extract from audio]
    Disease suffering: [Extract from document/audio]
    Patient Age: [Extract from audio]
    Contact number: [Extract]
    Email : [Extract]
    Languages known by the patient's relatives: [Extract]
    Potential of the lead: high

    Amount Needed for: [Amount from estimate]
    T&S Doctor approved amount  - [Amount]
    How urgent is the case and why? - [Urgency from audio]
    Estimated Date/Month of Surgery : [Extract]
    What is the current status of the patient : [Extract status]
    Amount Spent by Family Till Now : [Extract amount]
    How did the family manage to pay bills till now - [Extract]

    A small background of the patient: [3-4 sentence background]

    Father's work: [Extract]
    Mother's work: [Extract]

    Authenticity Check
    Source: Outbound
    City: [Extract]
    Hospital Name: [Extract]

    Estimate Attached- Yes
    Does Estimate have stamp and seal : Yes
    Does Estimate look genuine? : Yes
    Call Recording is attached? : Yes
    Family is comfortable with pricing? Yes 
    Family is comfortable with shoot? : Yes
    `;

    contents.push(prompt);

    // Call Gemini Model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: contents,
    });

    const generatedText = response.text || 'Failed to generate summary.';

    const caseSummary: GeneratedCaseSummary = {
      id: `case_${Date.now()}`,
      createdAt: new Date().toISOString(),
      patientName: input.patientName,
      bdName: input.bdName,
      shootDate: input.shootDate,
      fullText: generatedText,
      structuredData: {
        disease: 'Extracted via Multimodal AI',
        hospitalName: 'Extracted via Estimate Letter',
        totalEstimateAmount: 'See summary',
      },
    };

    return caseSummary;
  } catch (err: any) {
    console.error('Gemini generation error:', err);
    throw new Error(err?.message || 'Failed to generate case summary.');
  }
}

// Convert HTML File object to FilePayload (Base64)
export function fileToFilePayload(file: File): Promise<FilePayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
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
