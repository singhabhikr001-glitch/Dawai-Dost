import React from 'react';
import { BellRing, CalendarClock, CheckCircle2, FileWarning, X } from 'lucide-react';
import { FamilyMember, MedicineEntry } from '../types';

interface ReminderPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: MedicineEntry | null;
  member: FamilyMember | null;
  onProceedToRefill: (medicine: MedicineEntry) => void;
  onAttachRx: (medicine: MedicineEntry) => void;
}

export const ReminderPreviewModal: React.FC<ReminderPreviewModalProps> = ({
  isOpen,
  onClose,
  medicine,
  member,
  onProceedToRefill,
  onAttachRx,
}) => {
  if (!isOpen || !medicine || !member) return null;

  const isWithinWindow = medicine.daysRemaining <= 7;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-modal-title"
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-3" />

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-5 h-5 text-amber-600" aria-hidden="true" />
            <div>
              <h2 id="reminder-modal-title" className="font-display text-base font-semibold text-slate-900">
                5–7 Day Refill Reminder Preview
              </h2>
              <p className="text-xs text-slate-500">
                Triggered automatically before stock runs out
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reminder preview"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 pb-3 border-b border-slate-100">
            <span>
              Recipient: <strong className="text-slate-900">{member.name}</strong> ({member.relation})
            </span>
            <span className="font-mono tabular-nums text-amber-700 font-medium">
              {medicine.daysRemaining} days left
            </span>
          </div>

          {/* Simulated Caregiver / Patient Notification Message */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-sm text-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>DawaiDost Care Coordination · WhatsApp &amp; App Alert</span>
              <span className="font-mono">T-{medicine.daysRemaining}d</span>
            </div>
            <p className="leading-relaxed">
              Namaste Sharma family, <strong>{member.name}&apos;s</strong> supply of{' '}
              <strong>{medicine.prescribedBrand}</strong> ({medicine.medicineName}) has{' '}
              <strong className="font-mono tabular-nums">{medicine.daysRemaining} days</strong>{' '}
              remaining ({medicine.dosageSchedule}).
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {medicine.hasPrescription
                ? `Valid prescription ${medicine.rxNumber} is on file. Tap below to route to ${medicine.partnerPharmacy} for pharmacist verification (Batch & Expiry checked before dispatch).`
                : 'Action required: Please attach a valid prescription before our partner pharmacist can verify and dispatch this refill.'}
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-slate-500">
              <CalendarClock className="w-3.5 h-3.5 text-teal-700 shrink-0" aria-hidden="true" />
              <span>
                {isWithinWindow
                  ? 'Inside 5–7 day proactive refill window · Zero-gap RWA delivery available'
                  : 'Preview mode · Scheduled to auto-trigger when supply reaches 7 days'}
              </span>
            </div>
          </div>

          {medicine.hasPrescription ? (
            <div className="flex items-start gap-2.5 text-xs text-emerald-800 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium">Ready for One-Tap Pharmacist-Verified Refill</p>
                <p className="text-emerald-700 mt-0.5">
                  Verified against Rx {medicine.rxNumber} · No drug substitutions applied
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 text-xs text-red-800 bg-red-50/70 border border-red-200 rounded-xl p-3">
              <FileWarning className="w-4 h-4 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium">Prescription Missing — Dispatch Blocked</p>
                <p className="text-red-700 mt-0.5">
                  DawaiDost never dispatches chronic refills without a valid prescription.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:flex-1"
            >
              Dismiss
            </button>
            {medicine.hasPrescription ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedToRefill(medicine);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium sm:flex-[2]"
              >
                Approve Pharmacist-Verified Refill
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAttachRx(medicine);
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium sm:flex-[2]"
              >
                Attach Valid Prescription
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
