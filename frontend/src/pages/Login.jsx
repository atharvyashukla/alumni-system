import React, { useState } from 'react';
import { School, ArrowRight, ShieldCheck, Sparkles, UserCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';

export const Login = () => {
  const { loginWithToken } = useAuth();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loadingRole, setLoadingRole] = useState(null);

  const handleOAuthLogin = (provider) => {
    if (provider === 'google') {
      window.location.href = authApi.getGoogleLoginUrl();
    } else if (provider === 'linkedin') {
      window.location.href = authApi.getLinkedInLoginUrl();
    }
  };

  const handleDevLogin = async (rolePreset) => {
    setLoadingRole(rolePreset);
    try {
      let payload = {};
      if (rolePreset === 'student') {
        payload = {
          email: 'aarav.student@csjmu.ac.in',
          fullName: 'Aarav Gupta',
          role: 'student',
        };
      } else if (rolePreset === 'alumni') {
        payload = {
          email: 'priya.sharma@alumni.csjmu.ac.in',
          fullName: 'Priya Sharma',
          role: 'alumni',
        };
      } else if (rolePreset === 'admin') {
        payload = {
          email: 'admin@csjmu.ac.in',
          fullName: 'CSJMU Registrar Office',
          role: 'admin',
        };
      } else if (rolePreset === 'new_user') {
        payload = {
          email: customEmail.trim() || `user_${Date.now()}@example.ac.in`,
          fullName: customName.trim() || 'New Member',
          role: 'pending',
          collegeId: null,
        };
      }

      const res = await authApi.devLogin(payload);
      if (res.data.token) {
        await loginWithToken(res.data.token);
      }
    } catch (err) {
      console.error('Login error:', err);
      alert(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-stitch-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-card bg-navy-900 text-white shadow-layer2 mb-4 border border-navy-800">
          <School className="w-7 h-7 text-teal-500" />
        </div>
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-navy-950">
          Collegiate Alumni Engine
        </h2>
        <p className="mt-2 text-sm text-slate-600 font-sans">
          Institutional Heritage & Network Modernity
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-layer2 rounded-card border border-slate-200 sm:px-10 space-y-6">
          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuthLogin('google')}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-base border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-all shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => handleOAuthLogin('linkedin')}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-base border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-all shadow-xs"
            >
              <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>Continue with LinkedIn</span>
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-micro">
              <span className="bg-white px-3 text-slate-400 font-semibold">
                Instant Development Access
              </span>
            </div>
          </div>

          {/* Quick Dev Login Presets */}
          <div className="space-y-2">
            <p className="text-xs text-slate-500 text-center">
              Test any persona instantly without cloud OAuth credentials:
            </p>

            <button
              onClick={() => handleDevLogin('student')}
              disabled={loadingRole !== null}
              className="w-full flex items-center justify-between p-2.5 rounded-base border border-slate-200 hover:border-teal-600 hover:bg-teal-50/40 text-left transition-all group text-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-base bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  S
                </span>
                <div>
                  <div className="font-semibold text-slate-900">Demo Student</div>
                  <div className="text-[11px] text-slate-500">Aarav Gupta (3rd Year CSE)</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </button>

            <button
              onClick={() => handleDevLogin('alumni')}
              disabled={loadingRole !== null}
              className="w-full flex items-center justify-between p-2.5 rounded-base border border-slate-200 hover:border-teal-600 hover:bg-teal-50/40 text-left transition-all group text-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-base bg-navy-100 text-navy-900 flex items-center justify-center font-bold text-xs">
                  A
                </span>
                <div>
                  <div className="font-semibold text-slate-900">Verified Alumni</div>
                  <div className="text-[11px] text-slate-500">Priya Sharma (Sr. SWE @ Google)</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </button>

            <button
              onClick={() => handleDevLogin('admin')}
              disabled={loadingRole !== null}
              className="w-full flex items-center justify-between p-2.5 rounded-base border border-slate-200 hover:border-teal-600 hover:bg-teal-50/40 text-left transition-all group text-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-base bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                  ★
                </span>
                <div>
                  <div className="font-semibold text-slate-900">College Administrator</div>
                  <div className="text-[11px] text-slate-500">CSJMU Registrar Office</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
            </button>

            {/* Fresh New User to test Onboarding Flow from Scratch */}
            <button
              onClick={() => handleDevLogin('new_user')}
              disabled={loadingRole !== null}
              className="w-full py-2 px-3 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-base border border-teal-200 text-center transition-colors block mt-3"
            >
              {loadingRole === 'new_user' ? 'Logging in...' : '+ Test Fresh User Onboarding Flow from Scratch'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
