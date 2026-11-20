import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BellRing,
  CheckCircle2,
  Clock,
  Edit3,
  FastForward,
  FileWarning,
  MapPin,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { FamilyMember, MedicineEntry } from '../types';

interface RefillTrackerViewProps {
  familyMembers: FamilyMember[];
  medicines: MedicineEntry[];
  selectedMemberId: string;
  onSelectMember: (memberId: string) => void;
  onEditMedicine: (medicine: MedicineEntry) => void;
  onPreviewReminder: (medicine: MedicineEntry) => void;
  onApproveRefill: (medicine: MedicineEntry) => void;
  onSimulateDaysAdvance: () => void;
}

type StatusFilter = 'all' | 'due' | 'missing_rx';

export const RefillTrackerView: React.FC<RefillTrackerViewProps> = ({
  familyMembers,
  medicines,
  selectedMemberId,
  onSelectMember,
  onEditMedicine,
  onPreviewReminder,
  onApproveRefill,
  onSimulateDaysAdvance,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const memberMap = useMemo(() => {
    const map = new Map<string, FamilyMember>();
    familyMembers.forEach((m) => map.set(m.id, m));
    return map;
  }, [familyMembers]);

  const activeMember =
    selectedMemberId === 'all' ? null : memberMap.get(selectedMemberId) || null;

  const memberScopedMedicines = useMemo(() => {
    if (selectedMemberId === 'all') return medicines;
    return medicines.filter((m) => m.memberId === selectedMemberId);
  }, [medicines, selectedMemberId]);

  const dueWindowMedicines = useMemo(
    () => memberScopedMedicines.filter((m) => m.daysRemaining <= 7),
    [memberScopedMedicines]
  );

  const missingRxCount = useMemo(
    () => memberScopedMedicines.filter((m) => !m.hasPrescription).length,
    [memberScopedMedicines]
  );

  const primaryDueVerifiedMedicine = useMemo(
    () => dueWindowMedicines.find((m) => m.hasPrescription) || dueWindowMedicines[0] || null,
    [dueWindowMedicines]
  );

  const dueBundleTotal = useMemo(
    () =>
      dueWindowMedicines
        .filter((m) => m.hasPrescription)
        .reduce((sum, m) => sum + m.estimatedOrderValue, 0),
    [dueWindowMedicines]
  );

  const filteredMedicines = useMemo(() => {
    return memberScopedMedicines
      .filter((m) => {
        if (statusFilter === 'due') return m.daysRemaining <= 7;
        if (statusFilter === 'missing_rx') return !m.hasPrescription;
        return true;
      })
      .filter((m) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          m.medicineName.toLowerCase().includes(q) ||
          m.prescribedBrand.toLowerCase().includes(q) ||
          m.rxNumber.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [memberScopedMedicines, statusFilter, searchQuery]);

  const getSupplyStatus = (med: MedicineEntry) => {
    if (!med.hasPrescription) {
      return {
        label: 'Rx attachment required',
        tone: 'text-red-700',
        barColor: 'bg-red-500',
        icon: <FileWarning className="w-4 h-4 text-red-700 shrink-0" aria-hidden="true" />,
      };
    }
    if (med.daysRemaining <= 7) {
      return {
        label: '5–7 day refill window',
        tone: 'text-amber-700',
        barColor: 'bg-amber-500',
        icon: <Clock className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />,
      };
    }
    return {
      label: 'Supply on track',
      tone: 'text-emerald-700',
      barColor: 'bg-teal-600',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />,
    };
  };

  return (
    <div className="space-y-6">
      {/* Household & Regional RWA Context */}
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            Family Prescription &amp; Refill Tracker
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-600">
            <span className="inline-flex items-center gap-1 font-medium text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
              <span>
                {activeMember
                  ? activeMember.societyAddress
                  : 'Sharma Household · Noida Sector 100 & Greater Noida Zeta 1'}
              </span>
            </span>
            <span aria-hidden="true">·</span>
            <span>₹99/mo Family Plan</span>
            <span aria-hidden="true">·</span>
            <span>Partner Pharmacy Verified</span>
          </div>
        </div>

        {/* Simulation control for testing 5-7 day trigger */}
        <button
          type="button"
          onClick={onSimulateDaysAdvance}
          className="self-start lg:self-auto inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors whitespace-nowrap shrink-0"
        >
          <FastForward className="w-3.5 h-3.5 text-teal-700" aria-hidden="true" />
          <span>Simulate −2 Days Supply</span>
        </button>
      </section>

      {/* Family Member Switcher (Segmented Control) */}
      <section aria-label="Family Member Selector">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl overflow-x-auto">
          <button
            type="button"
            onClick={() => onSelectMember('all')}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-150 ${
              selectedMemberId === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Family ({medicines.length})
          </button>
          {familyMembers.map((member) => {
            const count = medicines.filter((m) => m.memberId === member.id).length;
            const due = medicines.filter(
              (m) => m.memberId === member.id && m.daysRemaining <= 7
            ).length;
            const isActive = selectedMemberId === member.id;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => onSelectMember(member.id)}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-150 flex items-center gap-2 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>
                  {member.relation} · {member.name.split(' ')[0]} ({member.city})
                </span>
                <span className="font-mono text-xs tabular-nums text-slate-500">{count}</span>
                {due > 0 && (
                  <span className="font-mono text-[11px] tabular-nums text-amber-700 font-semibold">
                    · {due} due
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Focal Anchor: 5-7 Day Refill Reminder Trigger & One-Tap Approval */}
      {primaryDueVerifiedMedicine && (
        <section
          aria-label="Refill Reminder Action"
          className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                <BellRing className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                <span>5–7 Day Refill Window Active</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {dueWindowMedicines.length}{' '}
                  {dueWindowMedicines.length === 1 ? 'medicine' : 'medicines'} due
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-semibold text-slate-900">
                {dueBundleTotal > 0
                  ? `${
                      activeMember ? `${activeMember.name}'s` : 'Household'
                    } verified refill bundle ready — ₹${dueBundleTotal.toLocaleString('en-IN')}`
                  : `${primaryDueVerifiedMedicine.prescribedBrand} needs prescription upload`}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {dueBundleTotal > 0
                  ? 'Valid prescriptions are attached. Approve in one tap to route this order to our licensed Noida/Greater Noida partner pharmacy for batch & expiry verification before evening delivery.'
                  : 'One or more medicines in the 5–7 day window are missing a valid prescription. Attach the prescription first so our partner pharmacist can verify and dispatch.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onPreviewReminder(primaryDueVerifiedMedicine)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-medium text-slate-800 inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
              >
                <BellRing className="w-4 h-4 text-slate-600" aria-hidden="true" />
                <span>Preview 5–7 Day Reminder</span>
              </button>
              <button
                type="button"
                onClick={() => onApproveRefill(primaryDueVerifiedMedicine)}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white text-sm font-medium inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all"
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>Approve Pharmacist-Verified Refill</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Search & Status Filters + Summary Metrics Row */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Active ({memberScopedMedicines.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('due')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === 'due'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Due ≤ 7 Days ({dueWindowMedicines.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('missing_rx')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === 'missing_rx'
                ? 'bg-white text-red-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rx Pending ({missingRxCount})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicine, brand, or Rx..."
            aria-label="Search medicines"
            className="w-full min-h-[44px] pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
      </section>

      {/* Medicine List Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
          <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-900">
            No medicines match this filter
          </p>
          <p className="text-xs text-slate-500">
            Clear your search or switch back to &ldquo;All Active&rdquo; to see the full family schedule.
          </p>
        </div>
      ) : (
        <section
          aria-label="Chronic Medicine List"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {filteredMedicines.map((med) => {
            const owner = memberMap.get(med.memberId);
            const status = getSupplyStatus(med);
            const progressPct = Math.min(100, Math.max(6, Math.round((med.daysRemaining / 30) * 100)));

            return (
              <article
                key={med.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Top Title + Days Remaining */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 mb-1">
                        {owner?.relation} ({owner?.name}) · {owner?.city}
                      </p>
                      <h3 className="font-display text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                        {med.prescribedBrand}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        {med.medicineName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-2xl font-bold tabular-nums text-slate-900 block leading-none">
                        {med.daysRemaining}d
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1 block">remaining</span>
                    </div>
                  </div>

                  {/* Supply Progress Bar + Explicit Semantic Status */}
                  <div className="space-y-1.5">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${status.barColor}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className={`inline-flex items-center gap-1.5 font-medium ${status.tone}`}>
                        {status.icon}
                        <span>{status.label}</span>
                      </span>
                      <span className="font-mono tabular-nums text-slate-600">
                        Est. ₹{med.estimatedOrderValue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Dosage & Pack Metadata (Unboxed with separators) */}
                  <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <p>
                      <span className="text-slate-500">Schedule:</span>{' '}
                      <span className="text-slate-800 font-medium">{med.dosageSchedule}</span>
                    </p>
                    <p>
                      <span className="text-slate-500">Pack Size:</span>{' '}
                      <span className="text-slate-800">
                        {med.stripSize} × {med.packCount}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span className="text-slate-500">Batch:</span>{' '}
                      <span className="font-mono text-slate-800">{med.batchNumber}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="text-slate-500">Exp:</span>{' '}
                      <span className="font-mono text-slate-800">{med.expiryDate}</span>
                    </p>
                    {med.hasPrescription ? (
                      <p className="text-teal-800">
                        Rx <span className="font-mono font-medium">{med.rxNumber}</span> ·{' '}
                        {med.prescribingDoctor}
                      </p>
                    ) : (
                      <p className="text-red-700 font-medium">
                        No prescription uploaded — required before refill verification
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Row (44px touch targets) */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onApproveRefill(med)}
                    className={`flex-1 min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                      med.hasPrescription
                        ? 'bg-teal-700 hover:bg-teal-800 text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {med.hasPrescription ? 'Approve Refill' : 'Attach Rx to Refill'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onPreviewReminder(med)}
                    aria-label={`Preview 5 to 7 day reminder for ${med.prescribedBrand}`}
                    className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                  >
                    <BellRing className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>Remind</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditMedicine(med)}
                    aria-label={`Edit ${med.prescribedBrand}`}
                    className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>Edit</span>
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};
