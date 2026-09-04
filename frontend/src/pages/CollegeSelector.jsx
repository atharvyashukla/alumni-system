import React, { useState, useEffect } from 'react';
import { School, Search, Plus, MapPin, Globe, Users, ArrowRight, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collegeApi } from '../api/client';
import { RegisterCollegeModal } from '../components/RegisterCollegeModal';

export const CollegeSelector = () => {
  const { user, attachCollege, logout } = useAuth();
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchColleges = async (term = '') => {
    try {
      setLoading(true);
      const res = await collegeApi.getAll(term);
      setColleges(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchColleges(search);
    }, 250);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSelectCollege = async (collegeId) => {
    try {
      setSubmittingId(collegeId);
      await attachCollege(collegeId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to select college.');
      setSubmittingId(null);
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
            <h1 className="font-display font-bold text-base leading-tight">Collegiate Network Registry</h1>
            <p className="text-xs text-slate-400">Step 1 of 3: Select Your Affiliated College</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-300 hidden sm:inline">
            Logged in as <strong className="text-white">{user?.fullName}</strong>
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-base transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy-950">Select Your Institution</h2>
            <p className="text-sm text-slate-600 mt-1">
              Connect to your collegiate database to access verified alumni rosters and student mentorship.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-base shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Register College</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search institutions by name, city, or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-card shadow-layer1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 transition-all"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        {/* Colleges List */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
            <span>Loading institutions directory...</span>
          </div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-card border border-slate-200 p-8 shadow-layer1">
            <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-display font-bold text-base text-slate-800">No institutions found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any college matching "{search}". You can register your institution right now.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-base transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Institution</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colleges.map((college) => (
              <div
                key={college.id}
                className="bg-white rounded-card border border-slate-200 p-5 shadow-layer1 hover:shadow-layer2 hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display font-bold text-base text-navy-950 group-hover:text-teal-700 transition-colors">
                      {college.name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                    {(college.city || college.state) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {[college.city, college.state].filter(Boolean).join(', ')}
                      </span>
                    )}

                    {college.domain && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        {college.domain}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    <span className="tabular-nums font-semibold text-slate-700">
                      {(college._count?.alumniProfiles || 0) + (college._count?.studentProfiles || 0)}
                    </span>
                    <span>members</span>
                  </div>

                  <button
                    onClick={() => handleSelectCollege(college.id)}
                    disabled={submittingId === college.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-navy-900 hover:bg-navy-800 active:bg-navy-950 text-white text-xs font-semibold rounded-base transition-colors disabled:opacity-50"
                  >
                    {submittingId === college.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Select</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Register College Modal */}
      <RegisterCollegeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCollegeCreated={(newCol) => {
          fetchColleges();
          handleSelectCollege(newCol.id);
        }}
      />
    </div>
  );
};
