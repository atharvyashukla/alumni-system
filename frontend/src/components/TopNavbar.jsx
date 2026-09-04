import React from 'react';
import { LogOut, School, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VerifiedBadge } from './VerifiedBadge';

export const TopNavbar = ({ currentTabTitle }) => {
  const { user, activeCollege, logout } = useAuth();
  const isVerifiedAlumni = user?.role === 'alumni' && user?.alumniProfile?.isVerified;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      {/* Title & College Tenant Context */}
      <div className="flex items-center gap-3">
        <h2 className="font-display font-bold text-base text-navy-950">
          {currentTabTitle}
        </h2>
        <span className="text-slate-300">|</span>
        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-pill border border-slate-200">
          <School className="w-3.5 h-3.5 text-teal-700" />
          <span className="font-semibold text-slate-800">{activeCollege?.name}</span>
        </div>
      </div>

      {/* User Status & Sign Out */}
      <div className="flex items-center gap-4">
        {isVerifiedAlumni && <VerifiedBadge isVerified={true} size="sm" />}

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xs uppercase">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-none">
              {user?.fullName}
            </div>
            <div className="text-[10px] text-teal-700 font-semibold uppercase tracking-micro mt-0.5">
              {user?.role}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-base transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
