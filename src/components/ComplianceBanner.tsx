import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const ComplianceBanner: React.FC = () => {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 text-xs sm:text-[13px] leading-relaxed text-slate-600">
          <ShieldCheck
            className="w-4 h-4 text-teal-700 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="font-medium text-slate-800">
              Licensed Partner Pharmacy &amp; Prescription Compliance Notice
            </p>
            <p>
              DawaiDost is a chronic-medicine refill and adherence coordination service for
              families and RWAs in Noida &amp; Greater Noida. DawaiDost is not a standalone
              pharmacy, does not provide medical advice or diagnoses, and makes no unverified drug
              substitutions. Every refill order requires a valid prescription and licensed
              pharmacist verification (with batch and expiry details) prior to dispatch.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
