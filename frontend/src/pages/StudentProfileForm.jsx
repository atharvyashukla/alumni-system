import React, { useState } from 'react';
import { School, GraduationCap, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StudentProfileForm = () => {
  const { user, activeCollege, submitStudentProfile, logout } = useAuth();

  const [branch, setBranch] = useState('Computer Science and Engineering');
  const [currentYear, setCurrentYear] = useState('3rd Year');
  const [enrollmentYear, setEnrollmentYear] = useState(new Date().getFullYear() - 2);
  const [expectedGraduationYear, setExpectedGraduationYear] = useState(new Date().getFullYear() + 2);
  const [rollNumber, setRollNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const branches = [
    'Computer Science and Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Commerce / Economics',
    'Management Studies (MBA/BBA)',
    'Other Specialization',
  ];

  const academicYears = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    'Final Year',
    'Postgraduate / Masters',
    'PhD Candidate',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitStudentProfile({
        branch,
        currentYear,
        enrollmentYear: parseInt(enrollmentYear, 10),
        expectedGraduationYear: parseInt(expectedGraduationYear, 10),
        rollNumber: rollNumber.trim() || undefined,
        phone: phone.trim() || undefined,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student profile.');
      setLoading(false);
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
            <p className="text-xs text-slate-400">Step 3 of 3: Complete Student Academic Record</p>
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

      {/* Form Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-6 md:py-12">
        <div className="bg-white rounded-card shadow-layer2 border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-base bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-navy-950">Student Profile Setup</h2>
              <p className="text-xs text-slate-500">
                Provide your academic enrollment details to enable verified campus mentorship matching.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3.5 rounded-base bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1.5">
                Academic Discipline / Branch *
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 text-slate-900 font-sans"
              >
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1.5">
                  Current Academic Year *
                </label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 text-slate-900 font-sans"
                >
                  {academicYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1.5">
                  University Roll / Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2023CS088"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 text-slate-900 tabular-nums"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1.5">
                  Enrollment Year *
                </label>
                <input
                  type="number"
                  min="2010"
                  max="2035"
                  value={enrollmentYear}
                  onChange={(e) => setEnrollmentYear(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1.5">
                  Expected Graduation Year *
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2035"
                  value={expectedGraduationYear}
                  onChange={(e) => setExpectedGraduationYear(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 text-slate-900 tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1.5">
                Contact Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 text-slate-900 tabular-nums"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-base shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <span>Complete Setup & Enter Portal</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
