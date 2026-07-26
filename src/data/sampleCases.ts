import { DDTInputForm, GeneratedCaseSummary } from '../types';

export const SAMPLE_INPUT_BABY_PRIYANKA: DDTInputForm = {
  patientName: 'Baby of Priyanka',
  bdName: 'Rohan Sharma',
  cmName: 'Sumit Chaurasiya',
  shootDate: new Date().toISOString().split('T')[0],
  shootLocation: 'Hospital',
  source: 'Outbound',
  callRecording: {
    fileName: 'DDT_Call_Recording_Priyanka_Hindi.mp3',
    fileType: 'audio/mp3',
    fileSize: 4200000,
    base64: ''
  },
  estimateLetter: {
    fileName: 'Horizon_Prime_Estimate_Letter.pdf',
    fileType: 'application/pdf',
    fileSize: 1800000,
    base64: ''
  },
  oldPics: [
    {
      fileName: 'Baby_Priyanka_Birth.jpg',
      fileType: 'image/jpeg',
      fileSize: 950000,
      base64: ''
    }
  ],
  hospitalPics: [
    {
      fileName: 'Baby_Priyanka_NICU.jpg',
      fileType: 'image/jpeg',
      fileSize: 1200000,
      base64: ''
    }
  ],
  additionalNotes: 'Campaigner confirmed Medibuddy and comfortable with hospital shoot within 48 hrs. Mother, father and patient will be present.'
};

export const SAMPLE_GENERATED_SUMMARY_BABY_PRIYANKA: GeneratedCaseSummary = {
  id: 'sample-case-101',
  createdAt: new Date().toISOString(),
  patientName: 'Baby of Priyanka',
  bdName: 'Rohan Sharma',
  cmName: 'Sumit Chaurasiya',
  shootDate: new Date().toISOString().split('T')[0],
  jiraCardText: `Shoot Date:- ${new Date().toISOString().split('T')[0]} Confirmed with the campaigner
BD Name: Rohan Sharma

Shoot will be done at the Hospital.

DDT Review: As per the DDT review, Patient diagnosed with Extreme premature with RDS, Neonatal sepsis, Thrombocytopenia  

Shoot Note: Confirmed with the family members they are comfortable to do the shoot at the hospital within next 48 hours as currently the patient is at the hospital 

Dear Team,

Please find the details of the lead being referred for Marketing :

PATIENT’S DETAILS
 
Patient name: Baby of Priyanka
Patient relatives: Priyanka Bhoir (Mother) 
Disease suffering: Extreme premature with RDS, Neonatal sepsis, Thrombocytopenia 
Patient Age: 1 month (Dob: 3 June 2026)
Contact number: 9987004130 
Email: vbhoir1984@gmail.com 
Languages known by the patient's relatives: Hindi
Potential of the lead: low
Potential- Low


Amount Needed for: 5 lakhs 
T&S Doctor approved amount - 5 lakhs 
How urgent is the case and why? - Immediate NICU oxygen support needed
Estimated Date/Month of Surgery : N/A (NICU Stay required)
What is the current status of the patient : Patient is at the hospital 
Amount Spent by Family Till Now : 6 lakhs
How did the family manage to pay bills till now - Personal Savings, Borrowed from friends and relatives, Loans, Sold the gold

A small background of the patient: Baby of Priyanka is a 1 month old boy diagnosed with Extreme premature with RDS, Neonatal sepsis, Thrombocytopenia. Baby was preterm during 7 months of pregnancy with a birth weight of 985g. No surgeries have been done. Currently the patient is in the NICU on oxygen support (Current weight :1100 Gms). 
Further line of treatment : NICU stay for 1 month.
Father works in a Telecom company as Admin Executive and earns Rs 30,000. No Income certificate attached. Mother is a housewife. 8 years have been completed for their arranged marriage, and the patient is their first child. 

Note: 5 times miscarriage had happened

Shoot will be done at the Hospital. Mother, Father and Patient will be available for the shoot.

Medibuddy was explained and confirmed by the campaigner.


Note: Sumit Chaurasiya will collect a consent letter at the time of the photoshoot.
(Mother, Father and Patient only will be available for the shoot)


Missing Documents: Income Certificate, No happy moments videos available, Doctor video bytes 

Authenticity Check
Source: Outbound
City: Thane
Hospital Name: Horizon Prime Hospital 
Hospital address: Thane 

CM: Sumit Chaurasiya 
BDM: Rohan Sharma


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
Does Estimate have stamp and seal : Yes
Does Estimate look genuine? : Yes
Does Estimate have ketto/a watermark: No
Old Pics are attached? Yes
Hospital Pics are attached? Yes 
Consent Letter Attached? Pending collection at shoot
Call Recording is attached? : Yes
Family is comfortable with pricing? Yes 
Family is comfortable with shoot? : Yes`,
  parsedDetails: {
    patientName: 'Baby of Priyanka',
    patientRelatives: 'Priyanka Bhoir (Mother), Father (Admin Exec)',
    diseaseSuffering: 'Extreme premature with RDS, Neonatal sepsis, Thrombocytopenia',
    patientAge: '1 month (Dob: 3 June 2026)',
    contactNumber: '9987004130',
    email: 'vbhoir1984@gmail.com',
    languagesKnown: 'Hindi',
    leadPotential: 'Low',
    amountNeeded: '5 lakhs',
    tsDoctorApprovedAmount: '5 lakhs',
    caseUrgency: 'High - NICU Oxygen support needed',
    estimatedSurgeryDate: 'N/A (NICU Stay required)',
    currentPatientStatus: 'Patient is at the hospital (NICU)',
    amountSpentByFamily: '6 lakhs',
    howManagedBills: 'Personal Savings, Borrowed from friends and relatives, Loans, Sold the gold',
    patientBackground: 'Baby of Priyanka is a 1 month old boy diagnosed with Extreme premature with RDS, Neonatal sepsis, Thrombocytopenia. Baby was preterm during 7 months of pregnancy with a birth weight of 985g. No surgeries have been done. Currently the patient is in the NICU on oxygen support (Current weight :1100 Gms). Further line of treatment: NICU stay for 1 month. Father works in a Telecom company as Admin Executive and earns Rs 30,000. Mother is a housewife.',
    fatherWork: 'Telecom company as Admin Executive (Earns Rs 30,000/pm)',
    motherWork: 'Housewife',
    noteNotes: '5 miscarriages in past 8 years of marriage. Patient is first child.',
    missingDocuments: ['Income Certificate', 'Happy moments videos', 'Doctor video bytes'],
    city: 'Thane',
    hospitalName: 'Horizon Prime Hospital',
    hospitalAddress: 'Thane, Maharashtra',
    cmName: 'Sumit Chaurasiya',
    bdName: 'Rohan Sharma',
    estimateAttached: true,
    doesEstimateHaveStampSeal: true,
    doesEstimateLookGenuine: true,
    doesEstimateHaveWatermark: false,
    oldPicsAttached: true,
    hospitalPicsAttached: true,
    consentLetterAttached: false,
    callRecordingAttached: true,
    familyComfortablePricing: true,
    familyComfortableShoot: true
  },
  callTranscriptSummary: {
    detectedLanguage: 'Hindi / Hinglish',
    keyTakeaways: [
      'Mother Priyanka & Father confirmed readiness for photoshoot at Horizon Prime Hospital within 48 hours.',
      'DDT team member explained Medibuddy crowdfunding process and campaign mechanics.',
      'Family has spent 6 Lakhs so far by selling gold, taking loans, and using personal savings.',
      'Father earns 30k/month; no income certificate available currently.',
      'Case Manager Sumit Chaurasiya will collect physical consent letter during photoshoot.'
    ],
    englishSummary: 'DDT call conducted in Hindi with campaigner & mother. All medical facts (Extreme premature, NICU stay, RDS) and financial background verified.'
  },
  authenticityCheck: {
    isVerified: true,
    verifiedItems: [
      'Estimate letter contains valid hospital seal and doctor signature.',
      'Hospital address matches Horizon Prime Hospital Thane.',
      'Family consent confirmed on recording.',
      'Hospital NICU pictures provided.'
    ],
    warnings: [
      'Missing Income Certificate - verify salary slip manually if required.',
      'Doctor video bytes pending from hospital staff.'
    ]
  }
};
