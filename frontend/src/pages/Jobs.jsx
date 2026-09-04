import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  MapPin,
  ExternalLink,
  Search,
  Building2,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jobApi } from '../api/client';

export const Jobs = () => {
  const { user, activeCollege } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [applyLink, setApplyLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobApi.getJobs(search ? { search } : undefined);
      setJobs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      await jobApi.createJob({
        title: title.trim(),
        company: company.trim(),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        applyLink: applyLink.trim() || undefined,
      });
      setIsModalOpen(false);
      setTitle('');
      setCompany('');
      setLocation('');
      setDescription('');
      setApplyLink('');
      fetchJobs();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to publish job.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy-950">Job & Internship Board</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Career opportunities, internships, and referral roles shared within {activeCollege?.name}.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-base shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post an Opportunity</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Filter jobs by title, company name, location, or tech stack..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-card shadow-layer1 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
      </div>

      {/* Job Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span>Retrieving opportunities...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-card border border-slate-200 p-12 text-center shadow-layer1">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-display font-bold text-base text-navy-950">No opportunities listed</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Be the first to share an opening or internship referral with your collegiate network!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-base"
          >
            Post an Opening
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-card border border-slate-200 shadow-layer1 hover:shadow-layer2 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-base text-navy-950">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mt-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{job.company}</span>
                    </div>
                  </div>

                  {job.location && (
                    <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-pill">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{job.location}</span>
                    </span>
                  )}
                </div>

                {job.description && (
                  <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400">
                  Shared by <strong className="text-slate-600">{job.postedByEmail}</strong> ({job.postedByRole})
                </div>

                {job.applyLink ? (
                  <a
                    href={job.applyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-base transition-colors"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="w-3 h-3 text-teal-400" />
                  </a>
                ) : (
                  <span className="text-slate-400 italic text-[11px]">Direct Contact</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-card shadow-layer3 border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm">Post Opportunity</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostJob} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
                  Job / Internship Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Associate Backend Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-base text-slate-900 focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Google India"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-base text-slate-900 focus:outline-hidden focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru / Hybrid"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-base text-slate-900 focus:outline-hidden focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
                  Application Link or Career URL
                </label>
                <input
                  type="url"
                  placeholder="https://company.com/careers/role"
                  value={applyLink}
                  onChange={(e) => setApplyLink(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-base text-slate-900 focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
                  Description & Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="Responsibilities, required skills, eligibility criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-base text-slate-900 focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-base shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
