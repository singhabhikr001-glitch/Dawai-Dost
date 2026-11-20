import React from 'react';
import {
  AlertTriangle,
  BellRing,
  LockKeyhole,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { ComplianceBanner } from './ComplianceBanner';

interface LoginScreenProps {
  isConfigured: boolean;
  missingEnvVars: string[];
  isSigningIn: boolean;
  authError: string | null;
  onSignInWithGoogle: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  isConfigured,
  missingEnvVars,
  isSigningIn,
  authError,
  onSignInWithGoogle,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8F7] text-slate-900">
      <header className="bg-white border-b border-slate-200/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-8">
          <span className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            DawaiDost
          </span>
          <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">
            Noida &amp; Greater Noida RWAs
          </span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Product Value & Compliance Positioning */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-teal-800">
                Chronic-Medicine Refill &amp; Adherence Coordination
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance leading-[1.15]">
                Keep your family&apos;s chronic refills on time, pharmacist-verified.
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                Coordinate prescription-backed refills across parents and household members in Noida
                and Greater Noida housing societies—without missed strips or unverified drug
                substitutions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5">
                <Users className="w-4 h-4 text-teal-700" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-slate-900">Family Tracker</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Track Father, Mother, and Self schedules with strip counts and days remaining.
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5">
                <BellRing className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-slate-900">5–7 Day Reminders</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Proactive refill triggers before chronic medications run out.
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <h2 className="text-sm font-semibold text-slate-900">Rx &amp; Batch Verified</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Licensed partner pharmacists verify valid prescriptions, batch, and expiry.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Sign-In Gate Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center">
                  <LockKeyhole className="w-5 h-5 text-teal-700" aria-hidden="true" />
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
                  Sign in to DawaiDost
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Signing in with your Google account protects your family&apos;s prescription
                  attachments, refill approvals, and adherence records.
                </p>
              </div>

              {!isConfigured ? (
                <div
                  role="alert"
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2.5 text-xs text-amber-950"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className="w-4 h-4 text-amber-700 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">Firebase Auth Setup Required</p>
                      <p className="text-amber-900 leading-relaxed">
                        Configure the following Vite environment variables in your environment or
                        <code className="font-mono mx-1 px-1 py-0.5 bg-amber-100 rounded">.env</code>
                        file to enable Google Sign-In:
                      </p>
                    </div>
                  </div>
                  <ul className="font-mono text-[11px] bg-white/80 border border-amber-200/80 rounded-xl p-3 space-y-1 text-slate-800 overflow-x-auto">
                    {missingEnvVars.map((envVar) => (
                      <li key={envVar}>{envVar}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Also ensure <strong>Google</strong> is enabled under Authentication &rarr; Sign-in
                    method in your Firebase console and this preview domain is in Authorized Domains.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {authError && (
                    <div
                      role="alert"
                      className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 leading-relaxed"
                    >
                      {authError}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={onSignInWithGoogle}
                    disabled={isSigningIn}
                    className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed border border-slate-300 shadow-xs text-sm font-semibold text-slate-900 flex items-center justify-center gap-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                  >
                    <svg
                      className="w-5 h-5 shrink-0"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                      />
                    </svg>
                    <span>{isSigningIn ? 'Signing in with Google...' : 'Continue with Google'}</span>
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
                By continuing, you access your private family refill coordinator. Refills are
                fulfilled only through licensed partner pharmacies against valid prescriptions.
              </div>
            </div>
          </div>
        </div>
      </main>

      <ComplianceBanner />
    </div>
  );
};
