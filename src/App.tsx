import { useEffect, useMemo, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { AdherenceCheckInView } from './components/AdherenceCheckInView';
import { ComplianceBanner } from './components/ComplianceBanner';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { MedicineModal } from './components/MedicineModal';
import { PilotAssumptionsView } from './components/PilotAssumptionsView';
import { RefillApprovalModal } from './components/RefillApprovalModal';
import { RefillOrdersView } from './components/RefillOrdersView';
import { RefillTrackerView } from './components/RefillTrackerView';
import { ReminderPreviewModal } from './components/ReminderPreviewModal';
import {
  INITIAL_CHECKINS,
  INITIAL_FAMILY_MEMBERS,
  INITIAL_MEDICINES,
  INITIAL_REFILL_ORDERS,
} from './data/sampleData';
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  missingFirebaseEnvVars,
} from './lib/firebase';
import {
  AdherenceCheckIn,
  AppView,
  MedicineEntry,
  RefillOrder,
} from './types';

const STORAGE_KEY = 'dawaidost_prototype_state_v1';

interface PersistedState {
  medicines: MedicineEntry[];
  orders: RefillOrder[];
  checkIns: AdherenceCheckIn[];
}

function loadInitialState(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (
        Array.isArray(parsed.medicines) &&
        Array.isArray(parsed.orders) &&
        Array.isArray(parsed.checkIns)
      ) {
        return {
          medicines: parsed.medicines,
          orders: parsed.orders,
          checkIns: parsed.checkIns,
        };
      }
    }
  } catch {
    // Fallback cleanly to default Noida sample data
  }
  return {
    medicines: INITIAL_MEDICINES,
    orders: INITIAL_REFILL_ORDERS,
    checkIns: INITIAL_CHECKINS,
  };
}

function formatFirebaseAuthError(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled before completion. Click Continue with Google to try again.';
    case 'auth/popup-blocked':
      return 'Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in your Firebase project. Add this URL under Firebase Console → Authentication → Settings → Authorized domains.';
    case 'auth/network-request-failed':
      return 'Network error while reaching Google Sign-In. Check your connection and retry.';
    default:
      return 'Unable to complete Google Sign-In. Verify your Firebase Auth settings and try again.';
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isFirebaseConfigured);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [initialState] = useState<PersistedState>(() => loadInitialState());
  const [activeView, setActiveView] = useState<AppView>('tracker');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');

  const [medicines, setMedicines] = useState<MedicineEntry[]>(initialState.medicines);
  const [orders, setOrders] = useState<RefillOrder[]>(initialState.orders);
  const [checkIns, setCheckIns] = useState<AdherenceCheckIn[]>(initialState.checkIns);

  // Modal states
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineEntry | null>(null);
  const [reminderMedicine, setReminderMedicine] = useState<MedicineEntry | null>(null);
  const [approvalMedicine, setApprovalMedicine] = useState<MedicineEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const payload: PersistedState = { medicines, orders, checkIns };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors in restricted environments
    }
  }, [medicines, orders, checkIns]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3600);
  };

  const handleSignInWithGoogle = async () => {
    if (!auth || !googleProvider) return;
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setAuthError(formatFirebaseAuthError(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    setIsSigningOut(true);
    try {
      await signOut(auth);
      setIsMedModalOpen(false);
      setEditingMedicine(null);
      setReminderMedicine(null);
      setApprovalMedicine(null);
      setActiveView('tracker');
    } catch {
      showToast('Could not sign out cleanly. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const dueCount = useMemo(
    () => medicines.filter((m) => m.daysRemaining <= 7).length,
    [medicines]
  );

  const handleOpenAddMedicine = () => {
    setEditingMedicine(null);
    setIsMedModalOpen(true);
  };

  const handleEditMedicine = (medicine: MedicineEntry) => {
    setEditingMedicine(medicine);
    setIsMedModalOpen(true);
  };

  const handleSaveMedicine = (entry: MedicineEntry) => {
    setMedicines((prev) => {
      const exists = prev.some((m) => m.id === entry.id);
      if (exists) {
        return prev.map((m) => (m.id === entry.id ? entry : m));
      }
      return [entry, ...prev];
    });
    showToast(`${entry.prescribedBrand} saved to family refill tracker.`);
  };

  const handleConfirmRefillOrder = (
    order: RefillOrder,
    refilledMedicineIds: string[]
  ) => {
    setOrders((prev) => [order, ...prev]);
    setMedicines((prev) =>
      prev.map((m) =>
        refilledMedicineIds.includes(m.id)
          ? {
              ...m,
              daysRemaining: m.daysRemaining + 30,
              lastRefilledDate: '20 Nov 2026',
            }
          : m
      )
    );
    showToast(`Order ${order.orderNumber} verified & scheduled.`);
  };

  const handleSimulateDaysAdvance = () => {
    setMedicines((prev) =>
      prev.map((m) => ({
        ...m,
        daysRemaining: Math.max(0, m.daysRemaining - 2),
      }))
    );
    showToast('Advanced household supply timeline by 2 days.');
  };

  const handleSubmitCheckIn = (checkIn: AdherenceCheckIn) => {
    setCheckIns((prev) => [checkIn, ...prev]);
    showToast(`Monthly check-in logged for ${checkIn.memberName}.`);
  };

  const handleResetSampleData = () => {
    setMedicines(INITIAL_MEDICINES);
    setOrders(INITIAL_REFILL_ORDERS);
    setCheckIns(INITIAL_CHECKINS);
    setSelectedMemberId('all');
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    showToast('Restored initial Noida & Greater Noida sample data.');
  };

  const getMemberById = (memberId: string | undefined) =>
    INITIAL_FAMILY_MEMBERS.find((m) => m.id === memberId) || null;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8F7] text-slate-700 px-4">
        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 text-center space-y-2 shadow-xs">
          <p className="font-display text-lg font-bold text-slate-900">DawaiDost</p>
          <p className="text-xs text-slate-500">Verifying your sign-in session...</p>
        </div>
      </div>
    );
  }

  if (!isFirebaseConfigured || !user) {
    return (
      <LoginScreen
        isConfigured={isFirebaseConfigured}
        missingEnvVars={missingFirebaseEnvVars}
        isSigningIn={isSigningIn}
        authError={authError}
        onSignInWithGoogle={handleSignInWithGoogle}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8F7] text-slate-900">
      <Header
        activeView={activeView}
        onSelectView={setActiveView}
        onAddMedicine={handleOpenAddMedicine}
        dueCount={dueCount}
        orderCount={orders.length}
        user={user}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeView === 'tracker' && (
          <RefillTrackerView
            familyMembers={INITIAL_FAMILY_MEMBERS}
            medicines={medicines}
            selectedMemberId={selectedMemberId}
            onSelectMember={setSelectedMemberId}
            onEditMedicine={handleEditMedicine}
            onPreviewReminder={(med) => setReminderMedicine(med)}
            onApproveRefill={(med) => setApprovalMedicine(med)}
            onSimulateDaysAdvance={handleSimulateDaysAdvance}
          />
        )}

        {activeView === 'checkin' && (
          <AdherenceCheckInView
            familyMembers={INITIAL_FAMILY_MEMBERS}
            checkIns={checkIns}
            onSubmitCheckIn={handleSubmitCheckIn}
          />
        )}

        {activeView === 'orders' && <RefillOrdersView orders={orders} />}

        {activeView === 'pilot' && (
          <PilotAssumptionsView
            medicines={medicines}
            orders={orders}
            checkIns={checkIns}
            onResetSampleData={handleResetSampleData}
          />
        )}
      </main>

      <ComplianceBanner />

      {/* Transient Accessible Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-18 md:bottom-6 right-4 left-4 sm:left-auto sm:max-w-sm z-40 bg-slate-900 text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-xl shadow-lg"
        >
          {toastMessage}
        </div>
      )}

      {/* Modals */}
      <MedicineModal
        isOpen={isMedModalOpen}
        onClose={() => {
          setIsMedModalOpen(false);
          setEditingMedicine(null);
        }}
        onSave={handleSaveMedicine}
        familyMembers={INITIAL_FAMILY_MEMBERS}
        editingMedicine={editingMedicine}
        defaultMemberId={selectedMemberId}
      />

      <ReminderPreviewModal
        isOpen={Boolean(reminderMedicine)}
        onClose={() => setReminderMedicine(null)}
        medicine={reminderMedicine}
        member={getMemberById(reminderMedicine?.memberId)}
        onProceedToRefill={(med) => setApprovalMedicine(med)}
        onAttachRx={(med) => handleEditMedicine(med)}
      />

      <RefillApprovalModal
        isOpen={Boolean(approvalMedicine)}
        onClose={() => setApprovalMedicine(null)}
        primaryMedicine={approvalMedicine}
        allMedicines={medicines}
        member={getMemberById(approvalMedicine?.memberId)}
        onConfirmOrder={handleConfirmRefillOrder}
        onOpenEditRx={(med) => handleEditMedicine(med)}
      />
    </div>
  );
}
