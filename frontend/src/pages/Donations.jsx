import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Trophy,
  Plus,
  Coins,
  ShieldCheck,
  Building2,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { donationApi } from '../api/client';

export const Donations = () => {
  const { user, activeCollege } = useAuth();
  const [summary, setSummary] = useState({ totalAmount: 0, totalDonations: 0, averageDonation: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('Merit Scholarship Fund');
  const [donorName, setDonorName] = useState(user?.fullName || '');
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await donationApi.getSummary(activeCollege?.id);
      setSummary(res.data.summary || { totalAmount: 0, totalDonations: 0, averageDonation: 0 });
      setLeaderboard(res.data.leaderboard || []);
      setRecentDonations(res.data.recentDonations || []);
    } catch (err) {
      console.error('Failed to load donations summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [activeCollege]);

  const handleMakeDonation = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      await donationApi.createDonation({
        collegeId: activeCollege?.id,
        donorName: donorName.trim(),
        donorEmail: user?.email,
        amount: parseFloat(amount),
        purpose,
        batchYear: user?.alumniProfile?.batchYear || undefined,
      });

      setFormSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setAmount('');
        setFormSuccess(false);
        fetchDonations();
      }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit donation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy-950">Giving & Endowments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Empowering students, labs, and research initiatives through alumni philanthropy at {activeCollege?.name}.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-base shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Contribute to College</span>
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-card border border-slate-200 p-5 shadow-layer1 border-t-2 border-t-teal-600">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-micro text-slate-600">
              Total Endowments Raised
            </span>
            <Coins className="w-4 h-4 text-teal-600" />
          </div>
          <div className="font-display font-bold text-2xl text-navy-950 tabular-nums">
            ₹{summary.totalAmount.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Directly funding academic initiatives</p>
        </div>

        <div className="bg-white rounded-card border border-slate-200 p-5 shadow-layer1 border-t-2 border-t-teal-600">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-micro text-slate-600">
              Total Contributions
            </span>
            <HeartHandshake className="w-4 h-4 text-teal-600" />
          </div>
          <div className="font-display font-bold text-2xl text-navy-950 tabular-nums">
            {summary.totalDonations}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Individual philanthropic gifts</p>
        </div>

        <div className="bg-white rounded-card border border-slate-200 p-5 shadow-layer1 border-t-2 border-t-teal-600">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-micro text-slate-600">
              Average Contribution
            </span>
            <Trophy className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-display font-bold text-2xl text-navy-950 tabular-nums">
            ₹{summary.averageDonation.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all graduation batches</p>
        </div>
      </div>

      {/* Leaderboard Table & Recent Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 10 Leaderboard (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-card border border-slate-200 shadow-layer1 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <h3 className="font-display font-bold text-sm text-navy-950">
                Top 10 Benefactor Leaderboard
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-micro">
              All-Time Contributions
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
              <span>Auditing financial registry...</span>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No recorded contributions for this institution yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-micro">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Benefactor</th>
                    <th className="py-3 px-4">Purpose / Initiative</th>
                    <th className="py-3 px-4 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs tabular-nums ${
                            index === 0
                              ? 'bg-amber-100 text-amber-900'
                              : index === 1
                              ? 'bg-slate-200 text-slate-800'
                              : index === 2
                              ? 'bg-amber-50 text-amber-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-navy-950">
                        <div>{item.donorName}</div>
                        {item.batchYear && (
                          <div className="text-[10px] text-slate-400 tabular-nums">
                            Class of {item.batchYear}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded-pill text-[11px]">
                          {item.purpose}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-teal-800 tabular-nums text-sm">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Contributions Feed */}
        <div className="bg-white rounded-card border border-slate-200 shadow-layer1 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-teal-600" />
            <h4 className="font-display font-bold text-sm text-navy-950">
              Recent Contributions
            </h4>
          </div>

          {recentDonations.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">No recent donations.</div>
          ) : (
            <div className="space-y-3">
              {recentDonations.map((d) => (
                <div key={d.id} className="p-3 bg-slate-50 rounded-base border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">{d.donorName}</span>
                    <span className="font-bold text-teal-700 tabular-nums">
                      ₹{d.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{d.purpose}</div>
                  <div className="text-[10px] text-slate-400 tabular-nums">
                    {new Date(d.donatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Donation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-card shadow-layer3 border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm">Contribute to University Fund</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMakeDonation} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Thank you for your generous contribution!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
                  Donor Full Name *
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-base text-slate-900 focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
                  Contribution Amount (INR ₹) *
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  placeholder="e.g. 25000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-base text-slate-900 focus:outline-hidden focus:border-teal-600 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
                  Cause / Purpose *
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-base text-slate-900 focus:outline-hidden focus:border-teal-600"
                >
                  <option value="Merit Scholarship Fund">Merit Scholarship Fund</option>
                  <option value="Women in STEM Initiative">Women in STEM Initiative</option>
                  <option value="Advanced Robotics & AI Lab Equipment">Advanced Robotics & AI Lab Equipment</option>
                  <option value="Campus Innovation Incubation Fund">Campus Innovation Incubation Fund</option>
                  <option value="Hostel & Sports Infrastructure">Hostel & Sports Infrastructure</option>
                </select>
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
                  disabled={submitting || formSuccess}
                  className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-base shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Confirm Contribution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
