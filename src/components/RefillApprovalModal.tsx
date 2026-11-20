import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  FileWarning,
  ShieldCheck,
  Smartphone,
  Truck,
  X,
} from 'lucide-react';
import { initiateUpiFirstRazorpayPayment } from '../lib/razorpay';
import { FamilyMember, MedicineEntry, RefillOrder } from '../types';

interface RefillApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryMedicine: MedicineEntry | null;
  allMedicines: MedicineEntry[];
  member: FamilyMember | null;
  userEmail?: string;
  userName?: string;
  onConfirmOrder: (order: RefillOrder, refilledMedicineIds: string[]) => void;
  onOpenEditRx: (medicine: MedicineEntry) => void;
}

export const RefillApprovalModal: React.FC<RefillApprovalModalProps> = ({
  isOpen,
  onClose,
  primaryMedicine,
  allMedicines,
  member,
  userEmail,
  userName,
  onConfirmOrder,
  onOpenEditRx,
}) => {
  const [bundleDueItems, setBundleDueItems] = useState(true);
  const [deliverySlot, setDeliverySlot] = useState(
    'Today, 6:00 PM – 8:00 PM (RWA Gate / Doorstep)'
  );
  const [confirmedOrder, setConfirmedOrder] = useState<RefillOrder | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const eligibleDueBundle = useMemo(() => {
    if (!primaryMedicine || !member) return [];
    return allMedicines.filter(
      (m) =>
        m.memberId === member.id &&
        m.hasPrescription &&
        (m.id === primaryMedicine.id || m.daysRemaining <= 7)
    );
  }, [allMedicines, member, primaryMedicine]);

  if (!isOpen || !primaryMedicine || !member) return null;

  const selectedItems =
    bundleDueItems && eligibleDueBundle.length > 1
      ? eligibleDueBundle
      : primaryMedicine.hasPrescription
      ? [primaryMedicine]
      : [];

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.estimatedOrderValue, 0);

  const handleClose = () => {
    setConfirmedOrder(null);
    setPaymentError(null);
    setIsProcessingPayment(false);
    onClose();
  };

  const handlePayAndConfirm = async () => {
    if (selectedItems.length === 0 || isProcessingPayment) return;

    setPaymentError(null);
    setIsProcessingPayment(true);

    try {
      const orderNumber = `DD-2026-${Math.floor(1030 + Math.random() * 890)}`;
      const paymentResult = await initiateUpiFirstRazorpayPayment({
        amountInRupees: totalAmount,
        purpose: 'refill',
        description: `Pharmacist-Verified Refill (${selectedItems.length} item${
          selectedItems.length > 1 ? 's' : ''
        }) · ${member.name}`,
        receipt: orderNumber,
        prefill: {
          name: userName || member.name,
          email: userEmail || '',
        },
        notes: {
          member_name: member.name,
          order_number: orderNumber,
          partner_pharmacy: primaryMedicine.partnerPharmacy,
        },
      });

      const order: RefillOrder = {
        id: `ord-${Date.now()}`,
        orderNumber,
        createdAt: '20 Nov 2026 · Just now',
        memberId: member.id,
        memberName: member.name,
        memberRelation: member.relation,
        deliveryAddress: member.societyAddress,
        items: selectedItems.map((item) => ({
          medicineId: item.id,
          medicineName: item.medicineName,
          prescribedBrand: item.prescribedBrand,
          packSummary: `${item.stripSize} × ${item.packCount}`,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          rxNumber: item.rxNumber,
          amount: item.estimatedOrderValue,
        })),
        totalAmount,
        membershipApplied: true,
        partnerPharmacy: primaryMedicine.partnerPharmacy,
        partnerLicenseNo: primaryMedicine.partnerLicenseNo,
        pharmacistName: primaryMedicine.pharmacistName,
        pharmacistRegNo: primaryMedicine.pharmacistRegNo,
        status: 'Pharmacist Verified · Scheduled',
        deliverySlot,
        paymentVerified: paymentResult.verified,
        razorpayPaymentId: paymentResult.razorpay_payment_id,
        razorpayOrderId: paymentResult.razorpay_order_id,
      };

      onConfirmOrder(
        order,
        selectedItems.map((i) => i.id)
      );
      setConfirmedOrder(order);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : 'Unable to complete UPI / Razorpay payment. Please try again.'
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-modal-title"
    >
      <div className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl max-h-[92vh] flex flex-col">
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 shrink-0" />

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h2 id="approval-modal-title" className="font-display text-lg font-semibold text-slate-900">
              {confirmedOrder
                ? 'Pharmacist-Verified Refill Paid & Scheduled'
                : 'Approve Pharmacist-Verified Refill'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {member.name} ({member.relation}) · {member.city}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close refill summary"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-4">
          {confirmedOrder ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-emerald-950">
                      Order <span className="font-mono">{confirmedOrder.orderNumber}</span> Confirmed
                    </p>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Routed to {confirmedOrder.partnerPharmacy}. Verified by{' '}
                      {confirmedOrder.pharmacistName} ({confirmedOrder.pharmacistRegNo}) with batch
                      and expiry recorded. Medicine supply timers have been updated (+30 days).
                    </p>
                  </div>
                </div>

                {confirmedOrder.paymentVerified && confirmedOrder.razorpayPaymentId && (
                  <div className="pt-2.5 border-t border-emerald-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                      <span>Payment Verified via UPI / Razorpay</span>
                    </span>
                    <span className="font-mono text-emerald-950">
                      {confirmedOrder.razorpayPaymentId}
                    </span>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100">
                <div className="p-3.5 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Delivery Location</span>
                  <span className="font-medium text-slate-900 text-right max-w-[65%]">
                    {confirmedOrder.deliveryAddress}
                  </span>
                </div>
                <div className="p-3.5 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Scheduled Handover</span>
                  <span className="font-medium text-slate-900">{confirmedOrder.deliverySlot}</span>
                </div>
                <div className="p-3.5 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Paid Total</span>
                  <span className="font-mono font-semibold text-sm text-slate-900 tabular-nums">
                    ₹{confirmedOrder.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium transition-colors"
              >
                Done — Return to Refill Tracker
              </button>
            </div>
          ) : !primaryMedicine.hasPrescription ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <FileWarning className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-red-950">
                    Valid Prescription Required Before Refill
                  </p>
                  <p className="text-xs text-red-800 leading-relaxed">
                    <strong>{primaryMedicine.prescribedBrand}</strong> ({primaryMedicine.medicineName})
                    currently has no attached prescription. DawaiDost coordinates refills exclusively
                    against valid prescriptions verified by a licensed partner pharmacist.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenEditRx(primaryMedicine);
                  }}
                  className="flex-[2] min-h-[44px] px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium"
                >
                  Attach Prescription Now
                </button>
              </div>
            </div>
          ) : (
            <>
              {eligibleDueBundle.length > 1 && (
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Bundle all {eligibleDueBundle.length} due refills for {member.relation}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Combines medicines due within 7 days into one verified RWA delivery
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={bundleDueItems}
                    onClick={() => setBundleDueItems((prev) => !prev)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                      bundleDueItems
                        ? 'bg-teal-700 text-white'
                        : 'bg-white border border-slate-300 text-slate-700'
                    }`}
                  >
                    {bundleDueItems ? 'Bundled' : 'Single Item'}
                  </button>
                </div>
              )}

              {/* Line Items with Batch, Expiry, and Rx Details */}
              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-200">
                {selectedItems.map((item) => (
                  <div key={item.id} className="p-3.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.prescribedBrand}
                        </p>
                        <p className="text-xs text-slate-600">
                          {item.medicineName} · {item.stripSize} × {item.packCount}
                        </p>
                      </div>
                      <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums shrink-0">
                        ₹{item.estimatedOrderValue.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span>
                        Batch <span className="font-mono text-slate-700">{item.batchNumber}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Exp <span className="font-mono text-slate-700">{item.expiryDate}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Rx <span className="font-mono text-teal-800">{item.rxNumber}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 font-medium">
                        Exact brand (no substitution)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pharmacist & Partner Pharmacy Verification */}
              <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-900">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" aria-hidden="true" />
                  <span>Partner Pharmacy &amp; Pharmacist Verification</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-500 block">Licensed Partner Pharmacy</span>
                    <span className="font-medium text-slate-900">
                      {primaryMedicine.partnerPharmacy}
                    </span>
                    <span className="block font-mono text-[11px] text-slate-500">
                      Lic: {primaryMedicine.partnerLicenseNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Verifying Pharmacist</span>
                    <span className="font-medium text-slate-900">
                      {primaryMedicine.pharmacistName}
                    </span>
                    <span className="block font-mono text-[11px] text-slate-500">
                      Reg: {primaryMedicine.pharmacistRegNo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Slot & Order Financial Summary */}
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="delivery-slot"
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5"
                  >
                    <Truck className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>Delivery Handover Window ({member.societyAddress})</span>
                  </label>
                  <select
                    id="delivery-slot"
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="Today, 6:00 PM – 8:00 PM (RWA Gate / Doorstep)">
                      Today, 6:00 PM – 8:00 PM (RWA Gate / Doorstep)
                    </option>
                    <option value="Tomorrow, 9:00 AM – 11:00 AM (Morning Slot)">
                      Tomorrow, 9:00 AM – 11:00 AM (Morning Slot)
                    </option>
                    <option value="Tomorrow, 6:00 PM – 8:00 PM (Evening Slot)">
                      Tomorrow, 6:00 PM – 8:00 PM (Evening Slot)
                    </option>
                  </select>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Medicines Subtotal ({selectedItems.length} items)</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>DawaiDost Coordination Fee (₹99/mo family plan)</span>
                    <span className="font-medium text-emerald-700">Included</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-slate-900">
                    <span>Total Payable via UPI / Razorpay</span>
                    <span className="font-mono tabular-nums text-base">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {paymentError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 leading-relaxed"
                >
                  {paymentError}
                </div>
              )}

              {/* UPI-First Payment Guidance + Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                  <Smartphone className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-800">
                      Pay via GPay, Paytm, PhonePe, UPI QR, or Card (powered by Razorpay)
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      On mobile browsers, UPI opens your installed UPI app directly; on desktop,
                      Razorpay displays a scannable UPI QR code.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isProcessingPayment}
                    className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 sm:flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePayAndConfirm}
                    disabled={isProcessingPayment}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 active:scale-[0.99] text-white text-sm font-medium sm:flex-[2] transition-all"
                  >
                    {isProcessingPayment
                      ? 'Opening Razorpay UPI Checkout...'
                      : `Pay & Confirm Refill Order (₹${totalAmount.toLocaleString('en-IN')})`}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
