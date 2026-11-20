import React, { useState } from 'react';
import { Building2, RotateCcw, Target, TrendingUp } from 'lucide-react';
import { VENTURE_ASSUMPTIONS } from '../data/sampleData';
import { AdherenceCheckIn, MedicineEntry, RefillOrder } from '../types';

interface PilotAssumptionsViewProps {
  medicines: MedicineEntry[];
  orders: RefillOrder[];
  checkIns: AdherenceCheckIn[];
  onResetSampleData: () => void;
}

export const PilotAssumptionsView: React.FC<PilotAssumptionsViewProps> = ({
  medicines,
  orders,
  checkIns,
  onResetSampleData,
}) => {
  const [simulatedFamilies, setSimulatedFamilies] = useState(201);

  const { pricing, beachhead, pilotSocieties, pilotTargets } = VENTURE_ASSUMPTIONS;
  const simRevenue = simulatedFamilies * pricing.revenuePerCustomer;
  const simVariableCost = simulatedFamilies * pricing.variableCostPerCustomer;
  const simContribution = simRevenue - simVariableCost;
  const simNetProfit = simContribution - pricing.monthlyFixedCost;

  // Live prototype metrics
  const rxUploadedCount = medicines.filter((m) => m.hasPrescription).length;
  const rxUploadPct =
    medicines.length > 0 ? Math.round((rxUploadedCount / medicines.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-teal-800 mb-1">
            Venture &amp; Pilot Review View
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            30-Day Pilot Targets &amp; Unit Economics
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
            Operational assumptions and break-even economics for DawaiDost&apos;s initial Noida and
            Greater Noida RWA launch.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetSampleData}
          className="self-start sm:self-auto inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* 30-Day Pilot Targets (4-column KPI strip) */}
      <section aria-label="30-Day Pilot Targets" className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Target className="w-4 h-4 text-teal-700" aria-hidden="true" />
          <h2>30-Day Pilot Targets</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pilotTargets.map((item) => (
            <div
              key={item.label}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-2"
            >
              <span className="text-xs font-medium text-slate-500">{item.label}</span>
              <span className="font-display text-2xl font-bold tabular-nums text-slate-900">
                {item.target}
              </span>
              <span className="text-xs text-slate-600 leading-relaxed">{item.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing & Unit Economics + Interactive Break-Even Explorer */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Unit Economics Ledger */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <TrendingUp className="w-4 h-4 text-teal-700" aria-hidden="true" />
              <h2>Pricing &amp; Unit Economics (Per Customer / Month)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Subscription coordination model paired with licensed partner pharmacy refill margin
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-sm">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">Family Membership Fee</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900">
                ₹{pricing.monthlyMembership} / month
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">Sample Average Refill Order</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900">
                ₹{pricing.sampleAvgOrderValue.toLocaleString('en-IN')} / order
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">Blended Revenue per Customer</span>
              <span className="font-mono font-semibold tabular-nums text-teal-800">
                ₹{pricing.revenuePerCustomer} / month
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">Variable Cost (Ops, Verification &amp; Last Mile)</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900">
                ₹{pricing.variableCostPerCustomer} / month
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">Contribution Margin per Customer</span>
              <span className="font-mono font-semibold tabular-nums text-emerald-700">
                ₹{pricing.contributionMargin} / month
              </span>
            </div>
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-slate-600">Monthly Fixed Cost</span>
              <span className="font-mono font-semibold tabular-nums text-slate-900">
                ₹{pricing.monthlyFixedCost.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="pt-3 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Break-Even Volume</span>
              <span className="font-mono text-lg font-bold tabular-nums text-slate-900">
                ~{pricing.breakEvenCustomers} customers
              </span>
            </div>
          </div>
        </div>

        {/* Right: Beachhead + Interactive Break-Even Slider */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Interactive Break-Even Simulator
              </h2>
              <span className="font-mono text-sm font-bold tabular-nums text-teal-800">
                {simulatedFamilies} households
              </span>
            </div>

            <div>
              <label htmlFor="family-scale-slider" className="sr-only">
                Simulated active households
              </label>
              <input
                id="family-scale-slider"
                type="range"
                min={10}
                max={400}
                step={1}
                value={simulatedFamilies}
                onChange={(e) => setSimulatedFamilies(Number(e.target.value))}
                className="w-full accent-teal-700 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                <span>10 (Pilot)</span>
                <span>201 (Break-Even)</span>
                <span>400 (2–3 RWAs)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div>
                <span className="block text-[11px] text-slate-500">Monthly Revenue</span>
                <span className="font-mono text-sm sm:text-base font-semibold tabular-nums text-slate-900">
                  ₹{simRevenue.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500">Contribution</span>
                <span className="font-mono text-sm sm:text-base font-semibold tabular-nums text-slate-900">
                  ₹{simContribution.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500">Net vs ₹40k Fixed</span>
                <span
                  className={`font-mono text-sm sm:text-base font-semibold tabular-nums ${
                    simNetProfit >= 0 ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {simNetProfit >= 0 ? '+' : '−'}₹{Math.abs(simNetProfit).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3 flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Building2 className="w-4 h-4 text-teal-700" aria-hidden="true" />
              <h2>Beachhead Focus &amp; Prototype Snapshot</h2>
            </div>
            <p className="text-xs text-slate-600">
              <strong className="text-slate-800">{beachhead}:</strong>{' '}
              {pilotSocieties.join(' · ')}
            </p>
            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Live Rx Rate</span>
                <span className="font-mono font-semibold text-sm tabular-nums text-slate-900">
                  {rxUploadPct}% ({rxUploadedCount}/{medicines.length})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Verified Orders</span>
                <span className="font-mono font-semibold text-sm tabular-nums text-slate-900">
                  {orders.length}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Check-Ins Logged</span>
                <span className="font-mono font-semibold text-sm tabular-nums text-slate-900">
                  {checkIns.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
