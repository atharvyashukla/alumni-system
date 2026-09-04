import React, { useState } from 'react';
import { School, Briefcase, AlertCircle, Loader2, LogOut, Linkedin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AlumniProfileForm = () => {
  const { user, activeCollege, submitAlumniProfile, logout } = useAuth();

  const [batchYear, setBatchYear] = useState(new Date().getFullYear() - 5);
  const [branch, setBranch] = useState('Computer Science and Engineering');
  const [currentCompany, setCurrentCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [sector, setSector] = useState('IT/Software');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
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

  const sectors = [
    'IT/Software',
    'Core Engineering',
    'Higher Studies',
    'Government',
    'Business',
    'Other',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitAlumniProfile({
        batchYear: parseInt(batchYear, 10),
        branch,
        currentCompany: currentCompany.trim() || undefined,
        designation: designation.trim() || undefined,
        sector,
        city: city.trim() || undefined,
        phone: phone.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save alumni profile.');
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
            <p className="text-xs text-slate-400">Step 3 of 3: Build Your Verified Alumni Record</p>
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
            <div className="w-8 h-8 rounded-base bg-navy-100 text-navy-900 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-navy-950">Alumni Profile Setup</h2>
              <p className="text-xs text-slate-500">
                Showcase your industry experience and enable students to connect with you for mentorship.
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1.5">
                  Graduation Batch Year *
                </label>
                <input
                  type="number"
                  min="1960"
                  max={new Date().getFullYear()}
                  value={batchYear}
                  onChange={(e) => setBatchYear(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 text-slate-900 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1.5">
                  Discipline / Branch *
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1.5">
                  Current Company / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google, Tata Motors, ISRO"
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1.5">
                  Job Designation / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Propulsion Engineer"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1.5">
                  Industry Sector *
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 text-slate-900 font-sans"
                >
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1.5">
                  Current City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru, Pune, London"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1.5">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 text-slate-900"
                />
                <Linkedin className="w-4 h-4 text-blue-600 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1.5">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 text-slate-900 tabular-nums"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-900 hover:bg-navy-800 active:bg-navy-950 text-white text-xs font-semibold rounded-base shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <span>Submit Profile & Enter Network</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
