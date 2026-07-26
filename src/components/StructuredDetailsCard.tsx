import React from 'react';
import {
  User,
  HeartPulse,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Building,
  Phone,
  Mail,
  Languages,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  FileCheck,
} from 'lucide-react';
import { ParsedCaseDetails, AuthenticityCheck } from '../types';

interface StructuredDetailsCardProps {
  details: ParsedCaseDetails;
  authenticityCheck: AuthenticityCheck;
}

export const StructuredDetailsCard: React.FC<StructuredDetailsCardProps> = ({
  details,
  authenticityCheck,
}) => {
  return (
    <div className="space-y-5">
      {/* Missing Documents Alert Banner if any */}
      {details.missingDocuments && details.missingDocuments.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Missing Documents Alert ({details.missingDocuments.length})
            </h4>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {details.missingDocuments.map((doc, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-semibold border border-amber-300/60"
                >
                  ⚠️ {doc}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid of Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Patient & Relatives Info */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Patient & Contact Details</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Patient Name:</span>
              <span className="font-semibold text-slate-900 text-right">{details.patientName || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Relatives:</span>
              <span className="font-medium text-slate-800 text-right">{details.patientRelatives || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Age / DOB:</span>
              <span className="font-medium text-slate-800 text-right">{details.patientAge || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Contact Number:</span>
              <span className="font-mono text-indigo-600 font-semibold text-right">{details.contactNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Email:</span>
              <span className="text-slate-700 text-right">{details.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Languages Spoken:</span>
              <span className="text-emerald-700 font-medium text-right">{details.languagesKnown || 'Hindi'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Lead Potential:</span>
              <span
                className={`font-bold uppercase text-[11px] px-2 py-0.5 rounded ${
                  (details.leadPotential || '').toLowerCase().includes('high')
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {details.leadPotential || 'Low'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Financial & Medical Review */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Financial & Medical Overview</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Amount Needed:</span>
              <span className="font-bold text-emerald-700 text-right text-sm">
                {details.amountNeeded || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Doctor Approved:</span>
              <span className="font-semibold text-slate-800 text-right">
                {details.tsDoctorApprovedAmount || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Amount Spent So Far:</span>
              <span className="font-semibold text-slate-900 text-right">
                {details.amountSpentByFamily || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">How Managed:</span>
              <span className="text-slate-700 text-right text-[11px]">
                {details.howManagedBills || 'Savings, Loans, Relatives'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Father's Occupation:</span>
              <span className="text-slate-800 text-right">{details.fatherWork || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Mother's Occupation:</span>
              <span className="text-slate-800 text-right">{details.motherWork || 'Housewife'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Patient Medical Background Narrative */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <HeartPulse className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Clinical Condition & Patient Background</h3>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Disease / Diagnosis:</span>
            <p className="font-bold text-rose-700 mt-0.5 text-sm">
              {details.diseaseSuffering || 'N/A'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Background Narrative:</span>
            <p className="text-slate-700 mt-1 leading-relaxed text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              {details.patientBackground || 'No narrative provided.'}
            </p>
          </div>

          {details.noteNotes && (
            <div className="pt-1 text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              📌 <strong>Important Note:</strong> {details.noteNotes}
            </div>
          )}
        </div>
      </div>

      {/* Card 4: Document Verification & Authenticity Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Authenticity Check & Verification</h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            {authenticityCheck.isVerified ? 'VERIFIED' : 'REVIEW NEEDED'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Estimate Stamp/Seal</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Yes
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Hospital Name</span>
            <span className="font-bold text-slate-900 truncate block mt-1">
              {details.hospitalName || 'Horizon Prime'}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Shoot Comfortable</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Pricing Comfortable</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
            </span>
          </div>
        </div>

        {/* Verified items list */}
        {authenticityCheck.verifiedItems && authenticityCheck.verifiedItems.length > 0 && (
          <div className="pt-2 text-xs">
            <span className="text-slate-500 font-medium block mb-1">Verification Signals:</span>
            <ul className="space-y-1">
              {authenticityCheck.verifiedItems.map((item, idx) => (
                <li key={idx} className="text-slate-700 flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
