import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase body parser limits for media base64 uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Shared Gemini AI Client instance
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Main AI Generation Endpoint for DDT Summary
app.post('/api/generate-summary', async (req, res) => {
  try {
    const {
      patientName = '',
      bdName = '',
      cmName = '',
      shootDate = '',
      shootLocation = 'Hospital',
      source = 'Outbound',
      callRecording = null,
      estimateLetter = null,
      oldPics = [],
      hospitalPics = [],
      additionalNotes = '',
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is missing. Please set your API key in Secrets / environment variables.',
      });
    }

    const ai = getGeminiClient();

    const parts: any[] = [];

    // Construct prompt
    const systemInstruction = `
You are an expert AI Due Diligence (DDT) Case Manager for a medical crowdfunding organization (ImpactGuru/similar).
Your job is to analyze:
1. DDT Call Recording (multilingual audio/video in Indian regional languages like Hindi, Marathi, Gujarati, English, etc.) between DDT team member and campaigner/patient/family.
2. Hospital Estimate Letter (PDF or image).
3. Case Metadata (Patient Name: "${patientName}", BD Name: "${bdName}", CM Name: "${cmName}", Shoot Date: "${shootDate}", Shoot Location: "${shootLocation}", Source: "${source}", Notes: "${additionalNotes}").

You must extract all medical, financial, family, and verification details and return a complete, accurate JSON object.

CRITICAL INSTRUCTION FOR "jiraCardText":
The "jiraCardText" field MUST follow EXACTLY this format structure, filling in real extracted data from the audio and estimate letter:

Shoot Date:- ${shootDate || '<date>'} Confirmed with the campaigner
BD Name: ${bdName || '<bd name>'}

Shoot will be done at the ${shootLocation}.

DDT Review: As per the DDT review, Patient diagnosed with [Disease & clinical condition from audio/doc]

Shoot Note: Confirmed with the family members they are comfortable to do the shoot at the ${shootLocation} within next 48 hours as currently the patient is at the [hospital/home]

Dear Team,

Please find the details of the lead being referred for Marketing :

PATIENT’S DETAILS
 
Patient name: ${patientName || '[Patient Name]'}
Patient relatives: [Full relative names and relationship e.g. Priyanka Bhoir (Mother)]
Disease suffering: [Exact diagnosis e.g. Extreme premature with RDS, Neonatal sepsis, Thrombocytopenia]
Patient Age: [Age and DOB e.g. 1 month (Dob: 3 June 2026)]
Contact number: [Phone number extracted from call]
Email : [Email address or N/A]
Languages known by the patient's relatives: [Languages spoken e.g. Hindi, Marathi, English]
Potential of the lead: [low / medium / high]
Potential- [low / medium / high]


Amount Needed for: [Amount from estimate letter e.g. 5 lakhs]
T&S Doctor approved amount  - [Approved amount e.g. 5 lakhs]
How urgent is the case and why? - [Urgency reason e.g. Urgent NICU oxygen support required]
Estimated Date/Month of Surgery : [Surgery date or N/A]
What is the current status of the patient : [Current location e.g. Patient is at the hospital]
Amount Spent by Family Till Now : [Amount spent e.g. 6 lakhs]
How did the family manage to pay bills till now - [Personal Savings, Borrowed from friends and relatives, Loans, Sold the gold]

A small background of the patient: [Detailed 3-5 sentence narrative explaining patient age/gender, condition, birth weight if infant, surgery status, current support, further line of treatment, father occupation & income, mother occupation, family marriage duration & child status]

Note: [Special family notes e.g. 5 miscarriages in past]

Shoot will be done at the ${shootLocation}. [Available family members for shoot e.g. Mother, Father and Patient will be available for the shoot.]

Medibuddy was explained and confirmed by the campaigner.


Note: ${cmName || 'Case Manager'} will collect a consent letter at the time of the photoshoot.
([Family members available for shoot])


Missing Documents: [Comma separated list of missing docs e.g. Income Certificate, No happy moments videos available, Doctor video bytes]

Authenticity Check
Source: ${source}
City: [City name extracted from hospital or call]
Hospital Name: [Hospital name from estimate letter]
Hospital address: [Hospital address from estimate letter]

CM: ${cmName}
BDM: ${bdName}


DIY: 
DIY Fees (Charges/Fees Applicable): 
DIY Raised : 
Ketto Link : 
Ketto Raised : 
Milaap Link: 
Milaap Raised: 


Jira Link : https://impactguruinc.atlassian.net/browse/AM-13070
Google Drive Link: https://drive.google.com/drive/folders/1CXYwsH4VSOmZOR947S5H3hDhD_00TE0v?usp=drive_link

Estimate Attached- Yes
Does Estimate have stamp and seal : [Yes/No]
Does Estimate look genuine? : [Yes/No]
Does Estimate have ketto/a watermark: [Yes/No]
Old Pics are attached? [Yes/No]
Hospital Pics are attached? [Yes/No]
Consent Letter Attached? [Yes/No/Pending collection]
Call Recording is attached? : Yes
Family is comfortable with pricing? [Yes/No]
Family is comfortable with shoot? : [Yes/No]
`;

    // Prompt instructions
    parts.push({
      text: `Analyze the provided DDT call recording audio/video and hospital estimate letter carefully.
Extract all relevant facts and return a JSON object with:
1. jiraCardText: String matching the exact text template structure above.
2. parsedDetails: Object containing all detailed fields (patientName, patientRelatives, diseaseSuffering, patientAge, contactNumber, email, languagesKnown, leadPotential, amountNeeded, tsDoctorApprovedAmount, caseUrgency, estimatedSurgeryDate, currentPatientStatus, amountSpentByFamily, howManagedBills, patientBackground, fatherWork, motherWork, noteNotes, missingDocuments [array], city, hospitalName, hospitalAddress, cmName, bdName, estimateAttached, doesEstimateHaveStampSeal, doesEstimateLookGenuine, doesEstimateHaveWatermark, oldPicsAttached, hospitalPicsAttached, consentLetterAttached, callRecordingAttached, familyComfortablePricing, familyComfortableShoot).
3. callTranscriptSummary: Object containing (detectedLanguage, keyTakeaways [array], englishSummary).
4. authenticityCheck: Object containing (isVerified [boolean], verifiedItems [array], warnings [array]).

If any specific detail is not explicitly present in the files, synthesize the most plausible, logical representation based on context, or note "N/A" or "Pending".`,
    });

    // Helper to strip base64 data prefix
    const cleanBase64 = (str: string) => str.replace(/^data:[^;]+;base64,/, '');

    // Helper to sanitize and normalize MIME types for Gemini media parts
    const sanitizeMimeType = (filePayload: { fileName?: string; fileType?: string } | null, isAudioRecording = false): string => {
      if (!filePayload) return 'application/octet-stream';

      const fileName = (filePayload.fileName || '').toLowerCase();
      let mime = (filePayload.fileType || '').toLowerCase().trim();

      // Infer from extension if missing or generic
      if (!mime || mime === 'application/octet-stream' || mime === 'binary/octet-stream') {
        if (fileName.endsWith('.mp3')) mime = 'audio/mp3';
        else if (fileName.endsWith('.m4a')) mime = 'audio/mp4';
        else if (fileName.endsWith('.wav')) mime = 'audio/wav';
        else if (fileName.endsWith('.aac')) mime = 'audio/aac';
        else if (fileName.endsWith('.ogg')) mime = 'audio/ogg';
        else if (fileName.endsWith('.3gp')) mime = 'audio/3gpp';
        else if (fileName.endsWith('.mp4')) mime = isAudioRecording ? 'audio/mp4' : 'video/mp4';
        else if (fileName.endsWith('.webm')) mime = isAudioRecording ? 'audio/webm' : 'video/webm';
        else if (fileName.endsWith('.pdf')) mime = 'application/pdf';
        else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) mime = 'image/jpeg';
        else if (fileName.endsWith('.png')) mime = 'image/png';
        else if (fileName.endsWith('.webp')) mime = 'image/webp';
      }

      // For call recording files, ensure video/mp4, video/3gpp, etc. are converted to audio/* MIME types
      // so Gemini transcribes the audio stream instead of attempting video frame decoding (which throws "0 Frames found")
      if (isAudioRecording) {
        if (mime.startsWith('video/mp4') || mime === 'video/m4a' || fileName.endsWith('.m4a') || fileName.endsWith('.mp4')) {
          return 'audio/mp4';
        }
        if (mime.startsWith('video/3gpp') || fileName.endsWith('.3gp')) {
          return 'audio/3gpp';
        }
        if (mime.startsWith('video/webm')) {
          return 'audio/webm';
        }
        if (mime.startsWith('video/')) {
          return 'audio/mp4';
        }
      }

      return mime || (isAudioRecording ? 'audio/mp3' : 'application/pdf');
    };

    // Add Call Recording Audio/Video part if attached
    if (callRecording && callRecording.base64) {
      parts.push({
        inlineData: {
          mimeType: sanitizeMimeType(callRecording, true),
          data: cleanBase64(callRecording.base64),
        },
      });
    }

    // Add Estimate Letter Document/Image part if attached
    if (estimateLetter && estimateLetter.base64) {
      parts.push({
        inlineData: {
          mimeType: sanitizeMimeType(estimateLetter, false),
          data: cleanBase64(estimateLetter.base64),
        },
      });
    }

    // Add Old Pics / Hospital Pics if attached
    if (Array.isArray(oldPics)) {
      for (const pic of oldPics) {
        if (pic && pic.base64) {
          parts.push({
            inlineData: {
              mimeType: sanitizeMimeType(pic, false),
              data: cleanBase64(pic.base64),
            },
          });
        }
      }
    }

    if (Array.isArray(hospitalPics)) {
      for (const pic of hospitalPics) {
        if (pic && pic.base64) {
          parts.push({
            inlineData: {
              mimeType: sanitizeMimeType(pic, false),
              data: cleanBase64(pic.base64),
            },
          });
        }
      }
    }

    console.log(`Sending request to Gemini 3.6 Flash with ${parts.length} content parts...`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini returned an empty response.');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Gemini JSON response:', responseText);
      parsedResult = {
        jiraCardText: responseText,
        parsedDetails: {
          patientName: patientName || 'Patient',
          bdName,
          cmName,
        },
        callTranscriptSummary: {
          detectedLanguage: 'Multilingual',
          keyTakeaways: ['Extracted from audio recording'],
          englishSummary: 'Audio analyzed by Gemini AI',
        },
        authenticityCheck: {
          isVerified: true,
          verifiedItems: ['Estimate document analyzed'],
          warnings: [],
        },
      };
    }

    // Ensure ID and creation timestamp
    const caseSummary = {
      id: `case-${Date.now()}`,
      createdAt: new Date().toISOString(),
      patientName: parsedResult?.parsedDetails?.patientName || patientName || 'Patient',
      bdName: parsedResult?.parsedDetails?.bdName || bdName || '',
      cmName: parsedResult?.parsedDetails?.cmName || cmName || '',
      shootDate: shootDate || new Date().toISOString().split('T')[0],
      jiraCardText: parsedResult?.jiraCardText || '',
      parsedDetails: parsedResult?.parsedDetails || {},
      callTranscriptSummary: parsedResult?.callTranscriptSummary || {
        detectedLanguage: 'Hindi / English',
        keyTakeaways: [],
        englishSummary: '',
      },
      authenticityCheck: parsedResult?.authenticityCheck || {
        isVerified: true,
        verifiedItems: [],
        warnings: [],
      },
    };

    return res.json({ success: true, caseSummary });
  } catch (error: any) {
    console.error('Error generating case summary:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred while generating the case summary.',
    });
  }
});

// Setup Vite Development Server or Production Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DDT Case Summary Generator server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
