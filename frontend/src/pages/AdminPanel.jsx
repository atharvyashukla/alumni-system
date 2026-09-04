import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  User,
  School,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api/client';
import { VerifiedBadge } from '../components/VerifiedBadge';

export const AdminPanel = () => {
  const { user, activeCollege } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        role: roleFilter || undefined,
      };
      const res = await adminApi.getUsers(activeCollege?.id, params);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load college users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, roleFilter, activeCollege]);

  const handleToggleVerify = async (alumniId, currentStatus) => {
    try {
      setTogglingId(alumniId);
      await adminApi.verifyAlumni(alumniId, !currentStatus);
      // Update local state smoothly
      setUsers((prev) =>
        prev.map((u) => {
          if (u.alumniProfile?.id === alumniId) {
            return {
              ...u,
              alumniProfile: {
                ...u.alumniProfile,
                isVerified: !currentStatus,
              },
            };
          }
          return u;
        })
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle verification status.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-pill border border-amber-200 inline-flex">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Governance Roll</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-navy-950 mt-1">
            Institutional User Roster & Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit registered members and manage official verified credentials for {activeCollege?.name}.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total Members: <strong className="text-slate-900 tabular-nums">{users.length}</strong>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-card border border-slate-200 shadow-layer1 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search member by legal name or institutional email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-base text-slate-900 focus:outline-hidden focus:bg-white focus:border-teal-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-base text-slate-700 focus:outline-hidden focus:border-teal-600 shrink-0 w-full sm:w-auto"
        >
          <option value="">All Institutional Roles</option>
          <option value="student">Students</option>
          <option value="alumni">Alumni</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-card border border-slate-200 shadow-layer1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-2 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
            <span>Auditing member credentials...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No member records found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-micro">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Affiliation / Career</th>
                  <th className="py-3 px-4">Verified Status</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const hasAlumniProfile = Boolean(u.alumniProfile);
                  const isVerified = u.alumniProfile?.isVerified || false;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-navy-950">
                        {u.fullName}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 tabular-nums">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10px] font-semibold uppercase tracking-micro px-2 py-0.5 rounded-pill border ${
                            u.role === 'alumni'
                              ? 'bg-navy-50 text-navy-900 border-navy-200'
                              : u.role === 'student'
                              ? 'bg-teal-50 text-teal-800 border-teal-200'
                              : 'bg-amber-50 text-amber-900 border-amber-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {u.studentProfile ? (
                          <span>
                            {u.studentProfile.branch} ({u.studentProfile.currentYear})
                          </span>
                        ) : u.alumniProfile ? (
                          <span>
                            {u.alumniProfile.designation || 'Alum'} at{' '}
                            <strong>{u.alumniProfile.currentCompany || 'Industry'}</strong> (
                            {u.alumniProfile.batchYear})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Profile pending</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {hasAlumniProfile ? (
                          isVerified ? (
                            <VerifiedBadge isVerified={true} size="sm" />
                          ) : (
                            <span className="inline-block text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-pill border border-amber-200">
                              Pending Audit
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {hasAlumniProfile ? (
                          <button
                            onClick={() => handleToggleVerify(u.alumniProfile.id, isVerified)}
                            disabled={togglingId === u.alumniProfile.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-base transition-colors ${
                              isVerified
                                ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {togglingId === u.alumniProfile.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : isVerified ? (
                              <>
                                <XCircle className="w-3 h-3" />
                                <span>Revoke Status</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verify Account</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[11px]">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
