export interface FilePayload {
  fileName: string;
  fileType: string;
  fileSize: number;
  base64: string; // Base64 data string (data URL or raw base64)
}

export interface DDTInputForm {
  patientName: string;
  bdName: string;
  cmName: string;
  shootDate: string;
  shootLocation: 'Hospital' | 'Home';
  source: string;
  callRecording: FilePayload | null;
  estimateLetter: FilePayload | null;
  oldPics: FilePayload[];
  hospitalPics: FilePayload[];
  additionalNotes: string;
}

export interface ParsedCaseDetails {
  patientName: string;
  patientRelatives: string;
  diseaseSuffering: string;
  patientAge: string;
  contactNumber: string;
  email: string;
  languagesKnown: string;
  leadPotential: 'High' | 'Medium' | 'Low' | string;
  amountNeeded: string;
  tsDoctorApprovedAmount: string;
  caseUrgency: string;
  estimatedSurgeryDate: string;
  currentPatientStatus: string;
  amountSpentByFamily: string;
  howManagedBills: string;
  patientBackground: string;
  fatherWork: string;
  motherWork: string;
  noteNotes: string;
  missingDocuments: string[];
  city: string;
  hospitalName: string;
  hospitalAddress: string;
  cmName: string;
  bdName: string;
  estimateAttached: boolean;
  doesEstimateHaveStampSeal: boolean;
  doesEstimateLookGenuine: boolean;
  doesEstimateHaveWatermark: boolean;
  oldPicsAttached: boolean;
  hospitalPicsAttached: boolean;
  consentLetterAttached: boolean;
  callRecordingAttached: boolean;
  familyComfortablePricing: boolean;
  familyComfortableShoot: boolean;
}

export interface CallTranscriptSummary {
  detectedLanguage: string;
  keyTakeaways: string[];
  englishSummary: string;
}

export interface AuthenticityCheck {
  isVerified: boolean;
  verifiedItems: string[];
  warnings: string[];
}

export interface GeneratedCaseSummary {
  id: string;
  createdAt: string;
  patientName: string;
  bdName: string;
  cmName: string;
  shootDate: string;
  jiraCardText: string;
  parsedDetails: ParsedCaseDetails;
  callTranscriptSummary: CallTranscriptSummary;
  authenticityCheck: AuthenticityCheck;
}

export interface CaseHistoryItem {
  id: string;
  createdAt: string;
  patientName: string;
  bdName: string;
  shootDate: string;
  summary: GeneratedCaseSummary;
}
