export type AppView = 'tracker' | 'checkin' | 'orders' | 'pilot';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  city: 'Noida' | 'Greater Noida';
  societyAddress: string;
  age: number;
  careFocus: string;
}

export interface MedicineEntry {
  id: string;
  memberId: string;
  medicineName: string;
  prescribedBrand: string;
  dosageSchedule: string;
  stripSize: string;
  packCount: number;
  daysRemaining: number;
  hasPrescription: boolean;
  rxNumber: string;
  prescribingDoctor: string;
  rxUploadedDate: string;
  rxFileName: string;
  estimatedOrderValue: number;
  batchNumber: string;
  expiryDate: string;
  partnerPharmacy: string;
  partnerLicenseNo: string;
  pharmacistName: string;
  pharmacistRegNo: string;
  lastRefilledDate: string;
}

export interface RefillOrderItem {
  medicineId: string;
  medicineName: string;
  prescribedBrand: string;
  packSummary: string;
  batchNumber: string;
  expiryDate: string;
  rxNumber: string;
  amount: number;
}

export interface RefillOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  memberId: string;
  memberName: string;
  memberRelation: string;
  deliveryAddress: string;
  items: RefillOrderItem[];
  totalAmount: number;
  membershipApplied: boolean;
  partnerPharmacy: string;
  partnerLicenseNo: string;
  pharmacistName: string;
  pharmacistRegNo: string;
  status: 'Pharmacist Verified · Scheduled' | 'Dispatched via RWA Desk' | 'Delivered';
  deliverySlot: string;
  paymentVerified?: boolean;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

export interface MembershipPaymentState {
  verified: boolean;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  verifiedAt?: string;
  amount: number;
}

export type MissedDosesOption =
  | '0 doses (None)'
  | '1–2 doses'
  | '3–5 doses'
  | '6+ doses';

export type RefillTimingOption =
  | 'Arrived right on time'
  | 'Reminder came early (helpful)'
  | 'Reminder arrived a bit late'
  | 'Needed prescription renewal help';

export interface AdherenceCheckIn {
  id: string;
  memberId: string;
  memberName: string;
  memberRelation: string;
  monthLabel: string;
  submittedAt: string;
  missedDoses: MissedDosesOption;
  refillTimingFeedback: RefillTimingOption;
  nonClinicalNote: string;
}
