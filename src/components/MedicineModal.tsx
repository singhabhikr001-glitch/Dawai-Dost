import React, { useEffect, useState } from 'react';
import { FileCheck2, FileWarning, Upload, X } from 'lucide-react';
import { FamilyMember, MedicineEntry } from '../types';

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: MedicineEntry) => void;
  familyMembers: FamilyMember[];
  editingMedicine: MedicineEntry | null;
  defaultMemberId: string;
}

const SCHEDULE_PRESETS = [
  'Once daily (morning)',
  'Once daily (empty stomach, 6:30 AM)',
  'Once daily (at bedtime)',
  'Twice daily (after breakfast & dinner)',
  '1 puff twice daily',
  'Once weekly (Sunday morning)',
];

export const MedicineModal: React.FC<MedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  familyMembers,
  editingMedicine,
  defaultMemberId,
}) => {
  const [memberId, setMemberId] = useState(defaultMemberId);
  const [medicineName, setMedicineName] = useState('');
  const [prescribedBrand, setPrescribedBrand] = useState('');
  const [dosageSchedule, setDosageSchedule] = useState(SCHEDULE_PRESETS[0]);
  const [stripSize, setStripSize] = useState('15 tablets / strip');
  const [packCount, setPackCount] = useState(2);
  const [daysRemaining, setDaysRemaining] = useState(7);
  const [estimatedOrderValue, setEstimatedOrderValue] = useState(500);
  const [hasPrescription, setHasPrescription] = useState(true);
  const [rxNumber, setRxNumber] = useState('RX-NOI-2026-4810');
  const [prescribingDoctor, setPrescribingDoctor] = useState(
    'Dr. Arvind Kapoor (Kailash Hospital, Noida)'
  );
  const [rxFileName, setRxFileName] = useState('Valid_Prescription_2026.pdf');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (editingMedicine) {
      setMemberId(editingMedicine.memberId);
      setMedicineName(editingMedicine.medicineName);
      setPrescribedBrand(editingMedicine.prescribedBrand);
      setDosageSchedule(editingMedicine.dosageSchedule);
      setStripSize(editingMedicine.stripSize);
      setPackCount(editingMedicine.packCount);
      setDaysRemaining(editingMedicine.daysRemaining);
      setEstimatedOrderValue(editingMedicine.estimatedOrderValue);
      setHasPrescription(editingMedicine.hasPrescription);
      setRxNumber(editingMedicine.rxNumber || 'RX-NOI-2026-5120');
      setPrescribingDoctor(
        editingMedicine.prescribingDoctor || 'Dr. Siddharth Jain (Yatharth Hospital, Greater Noida)'
      );
      setRxFileName(editingMedicine.rxFileName || 'Uploaded_Prescription_2026.pdf');
    } else {
      const targetMember =
        defaultMemberId && defaultMemberId !== 'all'
          ? defaultMemberId
          : familyMembers[0]?.id || 'member-father';
      setMemberId(targetMember);
      setMedicineName('');
      setPrescribedBrand('');
      setDosageSchedule(SCHEDULE_PRESETS[0]);
      setStripSize('15 tablets / strip');
      setPackCount(2);
      setDaysRemaining(6);
      setEstimatedOrderValue(500);
      setHasPrescription(true);
      setRxNumber(`RX-NOI-2026-${Math.floor(4100 + Math.random() * 899)}`);
      setPrescribingDoctor('Dr. Arvind Kapoor (Kailash Hospital, Noida)');
      setRxFileName('Family_Chronic_Rx_Nov2026.pdf');
    }
  }, [isOpen, editingMedicine, defaultMemberId, familyMembers]);

  if (!isOpen) return null;

  const selectedMember = familyMembers.find((m) => m.id === memberId) || familyMembers[0];
  const isGreaterNoida = selectedMember?.city === 'Greater Noida';

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRxFileName(file.name);
      setHasPrescription(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      setError('Please enter the medicine name and strength.');
      return;
    }
    if (!prescribedBrand.trim()) {
      setError('Please enter the exact prescribed brand to prevent unverified substitutions.');
      return;
    }
    if (hasPrescription && (!rxNumber.trim() || !prescribingDoctor.trim())) {
      setError('Please provide the prescription ID and prescribing doctor name.');
      return;
    }

    const entry: MedicineEntry = {
      id: editingMedicine ? editingMedicine.id : `med-${Date.now()}`,
      memberId,
      medicineName: medicineName.trim(),
      prescribedBrand: prescribedBrand.trim(),
      dosageSchedule: dosageSchedule.trim(),
      stripSize: stripSize.trim() || '15 tablets / strip',
      packCount: Math.max(1, Number(packCount) || 1),
      daysRemaining: Math.max(0, Number(daysRemaining) || 0),
      hasPrescription,
      rxNumber: hasPrescription ? rxNumber.trim() : '',
      prescribingDoctor: hasPrescription ? prescribingDoctor.trim() : '',
      rxUploadedDate: hasPrescription
        ? editingMedicine?.rxUploadedDate || '20 Nov 2026'
        : '',
      rxFileName: hasPrescription ? rxFileName || 'Prescription_Attached.pdf' : '',
      estimatedOrderValue: Math.max(50, Number(estimatedOrderValue) || 500),
      batchNumber: editingMedicine?.batchNumber || 'DDN2611A',
      expiryDate: editingMedicine?.expiryDate || '10/2028',
      partnerPharmacy: isGreaterNoida
        ? 'Alpha Wellness Pharmacy, Zeta 1, Greater Noida'
        : 'MedCare Chemists, Sector 100 Market, Noida',
      partnerLicenseNo: isGreaterNoida ? 'UP-GBN-21-2025-1140' : 'UP-GBN-20-2024-8812',
      pharmacistName: isGreaterNoida
        ? 'Priya Deshmukh, B.Pharm'
        : 'Rakesh Verma, B.Pharm',
      pharmacistRegNo: isGreaterNoida ? 'UPPC-52814' : 'UPPC-41902',
      lastRefilledDate: editingMedicine?.lastRefilledDate || '20 Oct 2026',
    };

    onSave(entry);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="med-modal-title"
    >
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl max-h-[92vh] flex flex-col">
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 shrink-0" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h2 id="med-modal-title" className="font-display text-lg font-semibold text-slate-900">
              {editingMedicine ? 'Edit Medicine Entry' : 'Add Chronic Medicine'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Coordinated strictly against a valid prescription · No unverified substitutions
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="med-member" className="block text-xs font-medium text-slate-700 mb-1.5">
              Family Member
            </label>
            <select
              id="med-member"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              {familyMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.relation} · {m.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="med-name" className="block text-xs font-medium text-slate-700 mb-1.5">
                Composition &amp; Strength
              </label>
              <input
                id="med-name"
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g., Metformin SR 500 mg"
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label htmlFor="med-brand" className="block text-xs font-medium text-slate-700 mb-1.5">
                Exact Prescribed Brand
              </label>
              <input
                id="med-brand"
                type="text"
                value={prescribedBrand}
                onChange={(e) => setPrescribedBrand(e.target.value)}
                placeholder="e.g., Glycomet-SR 500"
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="med-schedule" className="block text-xs font-medium text-slate-700 mb-1.5">
              Dosage Frequency / Schedule (from prescription)
            </label>
            <input
              id="med-schedule"
              list="schedule-presets"
              value={dosageSchedule}
              onChange={(e) => setDosageSchedule(e.target.value)}
              placeholder="e.g., Twice daily (after meals)"
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <datalist id="schedule-presets">
              {SCHEDULE_PRESETS.map((preset) => (
                <option key={preset} value={preset} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label htmlFor="med-strip" className="block text-xs font-medium text-slate-700 mb-1.5">
                Strip / Pack Size
              </label>
              <input
                id="med-strip"
                type="text"
                value={stripSize}
                onChange={(e) => setStripSize(e.target.value)}
                placeholder="15 tablets / strip"
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label htmlFor="med-packs" className="block text-xs font-medium text-slate-700 mb-1.5">
                Pack Count
              </label>
              <input
                id="med-packs"
                type="number"
                min={1}
                max={24}
                value={packCount}
                onChange={(e) => setPackCount(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label htmlFor="med-days" className="block text-xs font-medium text-slate-700 mb-1.5">
                Days Left
              </label>
              <input
                id="med-days"
                type="number"
                min={0}
                max={90}
                value={daysRemaining}
                onChange={(e) => setDaysRemaining(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="med-value" className="block text-xs font-medium text-slate-700 mb-1.5">
              Estimated Partner Pharmacy Refill Value (₹)
            </label>
            <input
              id="med-value"
              type="number"
              min={50}
              step={10}
              value={estimatedOrderValue}
              onChange={(e) => setEstimatedOrderValue(Number(e.target.value))}
              className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Prescription Attachment Section */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-800">
                Prescription Attachment Status
              </span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setHasPrescription(true)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    hasPrescription
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Valid Rx Attached
                </button>
                <button
                  type="button"
                  onClick={() => setHasPrescription(false)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    !hasPrescription
                      ? 'bg-white text-red-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pending Upload
                </button>
              </div>
            </div>

            {hasPrescription ? (
              <div className="space-y-3 bg-teal-50/50 border border-teal-200/70 rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-xs text-teal-800 font-medium">
                  <FileCheck2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Prescription ready for licensed pharmacist verification</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label htmlFor="rx-id" className="block text-[11px] font-medium text-slate-600 mb-1">
                      Prescription ID
                    </label>
                    <input
                      id="rx-id"
                      type="text"
                      value={rxNumber}
                      onChange={(e) => setRxNumber(e.target.value)}
                      className="w-full min-h-[40px] px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="rx-doc" className="block text-[11px] font-medium text-slate-600 mb-1">
                      Prescribing Doctor
                    </label>
                    <input
                      id="rx-doc"
                      type="text"
                      value={prescribingDoctor}
                      onChange={(e) => setPrescribingDoctor(e.target.value)}
                      className="w-full min-h-[40px] px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-slate-600 truncate">
                    File: <span className="font-mono text-slate-800">{rxFileName}</span>
                  </span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Replace File</span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFilePick}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 text-xs text-amber-900">
                  <FileWarning className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Refill orders are paused until a valid prescription is uploaded and verified by
                    the partner pharmacist.
                  </span>
                </div>
                <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-amber-300 hover:bg-amber-50 text-xs font-medium text-amber-900 cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Attach Rx</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFilePick}
                    className="sr-only"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium transition-colors"
            >
              {editingMedicine ? 'Save Changes' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
