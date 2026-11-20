import React, { useState } from 'react';
import { CalendarCheck2, CheckCircle2, Info } from 'lucide-react';
import {
  AdherenceCheckIn,
  FamilyMember,
  MissedDosesOption,
  RefillTimingOption,
} from '../types';

interface AdherenceCheckInViewProps {
  familyMembers: FamilyMember[];
  checkIns: AdherenceCheckIn[];
  onSubmitCheckIn: (checkIn: AdherenceCheckIn) => void;
}

const MISSED_DOSES_OPTIONS: MissedDosesOption[] = [
  '0 doses (None)',
  '1–2 doses',
  '3–5 doses',
  '6+ doses',
];

const REFILL_TIMING_OPTIONS: RefillTimingOption[] = [
  'Arrived right on time',
  'Reminder came early (helpful)',
  'Reminder arrived a bit late',
  'Needed prescription renewal help',
];

export const AdherenceCheckInView: React.FC<AdherenceCheckInViewProps> = ({
  familyMembers,
  checkIns,
  onSubmitCheckIn,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState(
    familyMembers[0]?.id || 'member-father'
  );
  const [missedDoses, setMissedDoses] = useState<MissedDosesOption>('0 doses (None)');
  const [refillTimingFeedback, setRefillTimingFeedback] =
    useState<RefillTimingOption>('Arrived right on time');
  const [nonClinicalNote, setNonClinicalNote] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(false);

  const selectedMember =
    familyMembers.find((m) => m.id === selectedMemberId) || familyMembers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const entry: AdherenceCheckIn = {
      id: `chk-${Date.now()}`,
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      memberRelation: selectedMember.relation,
      monthLabel: 'November 2026',
      submittedAt: '20 Nov 2026',
      missedDoses,
      refillTimingFeedback,
      nonClinicalNote: nonClinicalNote.trim(),
    };

    onSubmitCheckIn(entry);
    setNonClinicalNote('');
    setJustSubmitted(true);
    window.setTimeout(() => setJustSubmitted(false), 4000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
          Monthly Adherence Check-In
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
          A quick monthly check-in to make sure refills arrive before strips run out and delivery
          timing works smoothly for your household.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Coordination check-in only. DawaiDost does not offer medical advice or diagnosis—please
              contact your prescribing doctor for any symptoms or dosage questions.
            </span>
          </div>

          {justSubmitted && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-medium text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
              <span>
                Monthly check-in saved for {selectedMember?.name}. Thank you!
              </span>
            </div>
          )}

          {/* Member Selector */}
          <div>
            <span className="block text-xs font-semibold text-slate-800 mb-2">
              1. Who is taking the medicines for this check-in?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {familyMembers.map((member) => {
                const isSelected = member.id === selectedMemberId;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`min-h-[48px] px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/70 text-teal-950'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-sm font-semibold">{member.relation}</span>
                    <span className="block text-xs text-slate-500 truncate">
                      {member.name} · {member.city}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Missed Doses */}
          <div>
            <span className="block text-xs font-semibold text-slate-800 mb-2">
              2. Roughly how many doses were missed this month?
            </span>
            <div className="grid grid-cols-2 gap-2">
              {MISSED_DOSES_OPTIONS.map((option) => {
                const isSelected = missedDoses === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMissedDoses(option)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium text-left transition-colors ${
                      isSelected
                        ? 'border-teal-700 bg-teal-700 text-white'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Refill Timing Feedback */}
          <div>
            <span className="block text-xs font-semibold text-slate-800 mb-2">
              3. How was the refill timing &amp; delivery coordination?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REFILL_TIMING_OPTIONS.map((option) => {
                const isSelected = refillTimingFeedback === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRefillTimingFeedback(option)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium text-left transition-colors ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50 text-teal-950'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Non-Clinical Note */}
          <div>
            <label htmlFor="non-clinical-note" className="block text-xs font-semibold text-slate-800 mb-1.5">
              4. Optional non-clinical note (delivery slot, packaging, RWA gate instructions)
            </label>
            <textarea
              id="non-clinical-note"
              rows={3}
              value={nonClinicalNote}
              onChange={(e) => setNonClinicalNote(e.target.value)}
              placeholder="Example: Prefer evening delivery after 6:30 PM at Tower 4 lobby."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white text-sm font-medium transition-all"
          >
            Submit Monthly Check-In
          </button>
        </form>

        {/* Right / Check-In History */}
        <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Recent Family Check-Ins
            </h2>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {checkIns.length} logged
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {checkIns.map((item) => (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.memberName} ({item.memberRelation})
                  </p>
                  <span className="text-xs text-slate-500 font-mono">
                    {item.monthLabel}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 text-teal-800 font-medium">
                    <CalendarCheck2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{item.missedDoses}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{item.refillTimingFeedback}</span>
                </div>
                {item.nonClinicalNote && (
                  <p className="text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                    &ldquo;{item.nonClinicalNote}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};
