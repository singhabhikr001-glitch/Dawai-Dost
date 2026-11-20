import React from 'react';
import { CheckCircle2, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import { RefillOrder } from '../types';

interface RefillOrdersViewProps {
  orders: RefillOrder[];
}

export const RefillOrdersView: React.FC<RefillOrdersViewProps> = ({ orders }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
            Pharmacist-Verified Refill Orders
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Audit trail of prescription-backed refills, licensed partner pharmacy dispatch, and
            batch/expiry verification.
          </p>
        </div>
        <span className="text-xs font-mono tabular-nums text-slate-500">
          {orders.length} verified {orders.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
          <PackageCheck className="w-6 h-6 text-slate-400 mx-auto" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-900">No refill orders logged yet</p>
          <p className="text-xs text-slate-500">
            Use &ldquo;Approve Pharmacist-Verified Refill&rdquo; from the Refill Tracker to generate a
            verified order.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
            >
              {/* Top Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-mono text-sm font-semibold text-slate-900">
                      {order.orderNumber}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-sm font-medium text-slate-800">
                      {order.memberName} ({order.memberRelation})
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">{order.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-500">{order.deliveryAddress}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    {order.status === 'Delivered' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <Truck className="w-4 h-4 shrink-0" aria-hidden="true" />
                    )}
                    <span>{order.status}</span>
                  </span>
                  <span className="font-mono text-lg font-bold tabular-nums text-slate-900">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Line Items Table / List */}
              <div className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <div
                    key={`${order.id}-${item.medicineId}-${idx}`}
                    className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.prescribedBrand}{' '}
                        <span className="font-normal text-slate-500">({item.medicineName})</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.packSummary} · Batch{' '}
                        <span className="font-mono text-slate-700">{item.batchNumber}</span> · Exp{' '}
                        <span className="font-mono text-slate-700">{item.expiryDate}</span> · Rx{' '}
                        <span className="font-mono text-teal-800">{item.rxNumber}</span>
                      </p>
                    </div>
                    <span className="font-mono text-sm font-medium tabular-nums text-slate-800 shrink-0">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Verification Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
                  <span>
                    Verified by <strong>{order.pharmacistName}</strong> ({order.pharmacistRegNo}) ·{' '}
                    {order.partnerPharmacy} (Lic: {order.partnerLicenseNo})
                  </span>
                </span>
                <span className="text-slate-500 shrink-0">{order.deliverySlot}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
