import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  ClipboardCheck,
  LineChart,
  LogOut,
  PackageCheck,
  Pill,
  Plus,
} from 'lucide-react';
import { AppView } from '../types';

interface HeaderProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  onAddMedicine: () => void;
  dueCount: number;
  orderCount: number;
  user: User;
  onSignOut: () => void;
  isSigningOut: boolean;
}

const NAV_ITEMS: { id: AppView; label: string; shortLabel: string }[] = [
  { id: 'tracker', label: 'Refill Tracker', shortLabel: 'Tracker' },
  { id: 'checkin', label: 'Check-In', shortLabel: 'Check-In' },
  { id: 'orders', label: 'Refill Orders', shortLabel: 'Orders' },
  { id: 'pilot', label: 'Pilot Model', shortLabel: 'Pilot' },
];

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
  onAddMedicine,
  dueCount,
  orderCount,
  user,
  onSignOut,
  isSigningOut,
}) => {
  const [avatarFailed, setAvatarFailed] = useState(false);

  const displayName = user.displayName?.trim() || 'Family Coordinator';
  const email = user.email?.trim() || '';
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'DD';

  const renderIcon = (id: AppView, isActive: boolean) => {
    const cls = `w-5 h-5 ${isActive ? 'text-teal-700' : 'text-slate-500'}`;
    switch (id) {
      case 'tracker':
        return <Pill className={cls} aria-hidden="true" />;
      case 'checkin':
        return <ClipboardCheck className={cls} aria-hidden="true" />;
      case 'orders':
        return <PackageCheck className={cls} aria-hidden="true" />;
      case 'pilot':
        return <LineChart className={cls} aria-hidden="true" />;
    }
  };

  const renderAvatar = () => {
    if (user.photoURL && !avatarFailed) {
      return (
        <img
          src={user.photoURL}
          alt={displayName}
          referrerPolicy="no-referrer"
          onError={() => setAvatarFailed(true)}
          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
        />
      );
    }
    return (
      <div
        aria-hidden="true"
        className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center justify-center shrink-0"
      >
        {initials}
      </div>
    );
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200/90 md:sticky md:top-0 md:z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Primary Header Row */}
          <div className="h-14 md:h-16 flex items-center justify-between gap-4 md:gap-8">
            {/* Zone 1: Single-element brand wordmark */}
            <button
              type="button"
              onClick={() => onSelectView('tracker')}
              className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-md"
            >
              DawaiDost
            </button>

            {/* Zone 2: Desktop single-line text navigation */}
            <nav
              aria-label="Primary"
              className="hidden md:flex items-center gap-6 text-sm font-medium"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectView(item.id)}
                    className={`relative py-2 whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-sm ${
                      isActive
                        ? 'text-teal-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.id === 'tracker' && dueCount > 0 && (
                      <span className="ml-1.5 text-xs font-mono tabular-nums text-amber-700">
                        ({dueCount})
                      </span>
                    )}
                    {item.id === 'orders' && orderCount > 0 && (
                      <span className="ml-1.5 text-xs font-mono tabular-nums text-slate-400">
                        ({orderCount})
                      </span>
                    )}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-teal-700"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Authenticated user profile, Sign Out, and Add Medicine */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-2.5 pr-3 border-r border-slate-200">
                {renderAvatar()}
                <div className="hidden lg:block max-w-[160px] leading-tight">
                  <p className="text-xs font-semibold text-slate-900 truncate">{displayName}</p>
                  {email && <p className="text-[11px] text-slate-500 truncate">{email}</p>}
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  disabled={isSigningOut}
                  aria-label="Sign out"
                  className="min-h-[36px] px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onAddMedicine}
                className="inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Add Medicine</span>
              </button>
            </div>
          </div>

          {/* Mobile Authenticated User Bar (non-sticky so mobile sticky cap remains < 10%) */}
          <div className="md:hidden py-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {renderAvatar()}
              <div className="min-w-0 leading-tight">
                <p className="text-xs font-semibold text-slate-900 truncate">{displayName}</p>
                {email && <p className="text-[11px] text-slate-500 truncate">{email}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              disabled={isSigningOut}
              className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors disabled:opacity-60"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (56px fixed height, < 10% viewport height) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200"
      >
        <div className="grid grid-cols-4 h-14">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] px-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600 ${
                  isActive ? 'text-teal-700' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {renderIcon(item.id, isActive)}
                <span className="text-[11px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
