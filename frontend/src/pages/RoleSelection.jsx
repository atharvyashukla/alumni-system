import React, { useState } from 'react';
import { GraduationCap, Briefcase, ArrowRight, School, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RoleSelection = () => {
  const { user, activeCollege, selectRole, logout } = useAuth();
  const [loadingRole, setLoadingRole] = useState(null);

  const handleRoleChoose = async (role) => {
    try {
      setLoadingRole(role);
      await selectRole(role);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to select role.');
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-stitch-surface flex flex-col">
      {/* Top Header */}
      <header className="bg-navy-900 border-b border-white/10 px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-base bg-navy-800 border border-white/10 flex items-center justify-center">
            <School className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base leading-tight">
              {activeCollege?.name || 'Collegiate Network'}
            </h1>
            <p className="text-xs text-slate-400">Step 2 of 3: Declare Your Institutional Role</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-base transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Selection Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:py-16 flex flex-col justify-center">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-extrabold text-navy-950">
            Welcome, {user?.fullName}!
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
            Please choose your membership type for <strong>{activeCollege?.name}</strong>.
            This choice locks your profile capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: Student */}
          <button
            onClick={() => handleRoleChoose('student')}
            disabled={loadingRole !== null}
            className="bg-white rounded-card border-2 border-slate-200 hover:border-teal-600 p-8 shadow-layer1 hover:shadow-layer2 transition-all text-left group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

            <div>
              <div className="w-12 h-12 rounded-base bg-teal-50 text-teal-700 flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <GraduationCap className="w-6 h-6" />
              </div>

              <span className="text-[11px] font-semibold tracking-micro uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded-pill border border-teal-200">
                Academic Enrollee
              </span>

              <h3 className="font-display font-bold text-xl text-navy-950 mt-3 group-hover:text-teal-800 transition-colors">
                Current Student
              </h3>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Connect with verified graduates, request 1-on-1 industry mentorship with AI matching, and explore campus job opportunities.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700">
              <span>Enter as Student</span>
              {loadingRole === 'student' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </div>
          </button>

          {/* Option 2: Alumni */}
          <button
            onClick={() => handleRoleChoose('alumni')}
            disabled={loadingRole !== null}
            className="bg-white rounded-card border-2 border-slate-200 hover:border-navy-900 p-8 shadow-layer1 hover:shadow-layer2 transition-all text-left group flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

            <div>
              <div className="w-12 h-12 rounded-base bg-navy-50 text-navy-900 flex items-center justify-center mb-6 group-hover:bg-navy-900 group-hover:text-white transition-colors">
                <Briefcase className="w-6 h-6" />
              </div>

              <span className="text-[11px] font-semibold tracking-micro uppercase text-navy-800 bg-navy-50 px-2 py-0.5 rounded-pill border border-navy-200">
                Graduate & Professional
              </span>

              <h3 className="font-display font-bold text-xl text-navy-950 mt-3 group-hover:text-navy-900 transition-colors">
                Alumni / Graduate
              </h3>

              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Mentor students in your branch, post job openings, give back through university initiatives, and get verified credentials.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-navy-900">
              <span>Enter as Alumni</span>
              {loadingRole === 'alumni' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};
