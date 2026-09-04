import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Building2,
  MapPin,
  Linkedin,
  Sparkles,
  CheckCircle,
  Users,
  Loader2,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { directoryApi } from '../api/client';
import { VerifiedBadge } from '../components/VerifiedBadge';

export const Directory = ({ onRequestMentor }) => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [sector, setSector] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  const branches = [
    'Computer Science and Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Commerce / Economics',
    'Management Studies (MBA/BBA)',
  ];

  const sectors = [
    'IT/Software',
    'Core Engineering',
    'Higher Studies',
    'Government',
    'Business',
    'Other',
  ];

  const fetchDirectory = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        search: search.trim() || undefined,
        branch: branch || undefined,
        batchYear: batchYear || undefined,
        sector: sector || undefined,
        isVerified: verifiedOnly ? 'true' : undefined,
      };

      const res = await directoryApi.getAlumni(params);
      setAlumni(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load alumni directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDirectory(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, branch, batchYear, sector, verifiedOnly]);

  return (
    <div className="space-y-6">
      {/* Directory Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy-950">Alumni Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, search, and connect with verified graduates across industries and graduation eras.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900 tabular-nums">{pagination.total}</strong> alumni
          </span>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-card border border-slate-200 shadow-layer1 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search alumni by name, company, job title, city, or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-base text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-base text-slate-700 focus:outline-hidden focus:border-teal-600"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Batch Year (e.g. 2019)"
            value={batchYear}
            onChange={(e) => setBatchYear(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-base text-slate-700 focus:outline-hidden focus:border-teal-600 tabular-nums"
          />

          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-base text-slate-700 focus:outline-hidden focus:border-teal-600"
          >
            <option value="">All Industry Sectors</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-base text-xs font-semibold border transition-all ${
              verifiedOnly
                ? 'bg-teal-50 border-teal-500 text-teal-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle className={`w-3.5 h-3.5 ${verifiedOnly ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>Verified Alumni Only</span>
          </button>
        </div>
      </div>

      {/* Alumni Results Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span>Searching collegiate alumni directory...</span>
        </div>
      ) : alumni.length === 0 ? (
        <div className="bg-white rounded-card border border-slate-200 p-12 text-center shadow-layer1">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-display font-bold text-base text-navy-950">No alumni matched your filters</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, selecting "All Branches", or turning off the verified-only filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setBranch('');
              setBatchYear('');
              setSector('');
              setVerifiedOnly(false);
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-base transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {alumni.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-card border border-slate-200 shadow-layer1 hover:shadow-layer2 hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header: Name + Verified Medallion */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-base text-navy-950 leading-snug">
                      {item.user?.fullName}
                    </h3>
                    <div className="text-[11px] font-semibold text-slate-500 tabular-nums mt-0.5">
                      Class of {item.batchYear} • {item.branch}
                    </div>
                  </div>
                  {item.isVerified && <VerifiedBadge isVerified={true} size="sm" />}
                </div>

                {/* Role & Company */}
                <div className="mt-4 space-y-2 text-xs">
                  {(item.designation || item.currentCompany) && (
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {item.designation || 'Professional'}{' '}
                        {item.currentCompany && (
                          <>
                            at <strong className="text-slate-900">{item.currentCompany}</strong>
                          </>
                        )}
                      </span>
                    </div>
                  )}

                  {item.city && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{item.city}</span>
                    </div>
                  )}

                  {item.sector && (
                    <div className="pt-2">
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-micro text-teal-800 bg-teal-50 px-2 py-0.5 rounded-pill border border-teal-200">
                        {item.sector}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                {item.linkedinUrl ? (
                  <a
                    href={item.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-base transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No LinkedIn linked</span>
                )}

                {onRequestMentor && (
                  <button
                    onClick={() => onRequestMentor(item)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 px-3 py-1.5 rounded-base transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    <span>Request Mentorship</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => fetchDirectory(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-3 py-1.5 text-xs font-semibold rounded-base border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500 tabular-nums">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchDirectory(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1.5 text-xs font-semibold rounded-base border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
