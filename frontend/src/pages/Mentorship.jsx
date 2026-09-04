import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Building2,
  Loader2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mentorshipApi } from '../api/client';
import { VerifiedBadge } from '../components/VerifiedBadge';

export const Mentorship = ({ preselectedMentor }) => {
  const { user, activeCollege } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('finder'); // 'finder' | 'requests'

  // AI Finder State
  const [inquiry, setInquiry] = useState(
    'I am looking for guidance on preparing for software engineering roles, distributed systems architecture, and system design interviews.'
  );
  const [branch, setBranch] = useState(user?.studentProfile?.branch || 'Computer Science and Engineering');
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [aiError, setAiError] = useState(null);

  // Requests State
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Request Modal State
  const [selectedTargetAlumni, setSelectedTargetAlumni] = useState(preselectedMentor || null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSuccessMessage, setRequestSuccessMessage] = useState(null);

  useEffect(() => {
    if (preselectedMentor) {
      setSelectedTargetAlumni(preselectedMentor);
      setActiveSubTab('finder');
    }
  }, [preselectedMentor]);

  const handleRunAiMatching = async (e) => {
    if (e) e.preventDefault();
    if (!inquiry.trim()) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const res = await mentorshipApi.suggest({
        message: inquiry.trim(),
        branch: branch.trim(),
      });
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      console.error('AI Matching error:', err);
      setAiError(err.response?.data?.message || 'Failed to generate AI mentor suggestions.');
    } finally {
      setAiLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const isAlumni = user?.role === 'alumni';
      const res = await mentorshipApi.getRequests(isAlumni ? { asAlumni: 'true' } : { asStudent: 'true' });
      setRequests(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'requests') {
      fetchRequests();
    }
  }, [activeSubTab]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!selectedTargetAlumni) return;

    setSendingRequest(true);
    try {
      await mentorshipApi.createRequest({
        alumniId: selectedTargetAlumni.alumniId || selectedTargetAlumni.id,
        message: requestMessage.trim(),
      });
      setRequestSuccessMessage(`Request successfully sent to ${selectedTargetAlumni.name || selectedTargetAlumni.user?.fullName}!`);
      setTimeout(() => {
        setSelectedTargetAlumni(null);
        setRequestMessage('');
        setRequestSuccessMessage(null);
        setActiveSubTab('requests');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send mentorship request.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await mentorshipApi.updateStatus(requestId, newStatus);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy-950">AI Mentorship Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Powered by Google Gemini to analyze career trajectories and connect students with verified mentors.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-base border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('finder')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-base text-xs font-semibold transition-all ${
              activeSubTab === 'finder'
                ? 'bg-white text-navy-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Matchmaker</span>
          </button>

          <button
            onClick={() => setActiveSubTab('requests')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-base text-xs font-semibold transition-all ${
              activeSubTab === 'requests'
                ? 'bg-white text-navy-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-3.5 h-3.5 text-slate-500" />
            <span>My Requests</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI MATCHMAKER */}
      {activeSubTab === 'finder' && (
        <div className="space-y-6">
          {/* AI Prompt Input Box */}
          <div className="bg-white rounded-card border border-slate-200 p-6 shadow-layer1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-base bg-teal-50 text-teal-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="font-display font-bold text-sm text-navy-950">
                What career guidance or skills are you looking for?
              </h2>
            </div>

            <form onSubmit={handleRunAiMatching} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <textarea
                    rows={3}
                    value={inquiry}
                    onChange={(e) => setInquiry(e.target.value)}
                    placeholder="Describe your career goals, questions about industries, or interview preparation needs..."
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-base text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 transition-all"
                  />
                </div>

                <div className="flex flex-col justify-between gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-micro mb-1">
                      Target Discipline / Branch
                    </label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-base text-slate-900 focus:outline-hidden focus:border-teal-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-base shadow-sm transition-all disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing Verified Alumni with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Find Best Matched Mentors</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* AI Results */}
          {aiError && (
            <div className="p-4 rounded-base bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{aiError}</span>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-navy-950">
                  Top AI Suggested Alumni Mentors
                </h3>
                <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2.5 py-1 rounded-pill border border-teal-200">
                  Gemini Evaluated
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {suggestions.map((item, idx) => (
                  <div
                    key={item.alumniId || idx}
                    className="bg-white rounded-card border border-slate-200 shadow-layer1 hover:shadow-layer2 p-5 flex flex-col justify-between border-t-2 border-t-teal-600 relative overflow-hidden"
                  >
                    <div>
                      {/* Top Match Score Pill */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-pill border border-teal-200 tabular-nums">
                          {item.matchScore}% Match
                        </span>
                        <VerifiedBadge isVerified={true} size="sm" />
                      </div>

                      <h4 className="font-display font-bold text-base text-navy-950 leading-snug">
                        {item.name}
                      </h4>

                      <div className="text-xs font-semibold text-slate-700 mt-1">
                        {item.highlight}
                      </div>

                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {item.alumni?.branch} • Class of {item.alumni?.batchYear}
                      </div>

                      {/* Gemini Rationale Box */}
                      <div className="mt-4 p-3 bg-slate-50 rounded-base border border-slate-100 text-xs text-slate-600 leading-relaxed italic">
                        "{item.reason}"
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedTargetAlumni(item)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-base transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 text-teal-400" />
                        <span>Send Mentorship Request</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY REQUESTS */}
      {activeSubTab === 'requests' && (
        <div className="bg-white rounded-card border border-slate-200 shadow-layer1 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-navy-950">
              {user?.role === 'alumni' ? 'Mentorship Inquiries Received' : 'Mentorship Inquiries Sent'}
            </h3>
            <span className="text-xs text-slate-500 tabular-nums font-semibold">
              {requests.length} records
            </span>
          </div>

          {requestsLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
              <span>Loading mentorship inquiries...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 p-6">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No mentorship requests yet</p>
              <p className="text-xs text-slate-500 mt-1">
                {user?.role === 'alumni'
                  ? 'Students will request mentorship here as they discover your profile.'
                  : 'Use the AI Matchmaker tab to find and contact verified alumni.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((req) => (
                <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-navy-950 text-sm">
                        {user?.role === 'alumni' ? req.studentName : req.alumni?.user?.fullName}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        {user?.role === 'alumni' ? req.studentEmail : req.alumni?.currentCompany}
                      </span>
                    </div>

                    {req.message && (
                      <p className="text-xs text-slate-600 max-w-2xl italic bg-slate-50 p-2.5 rounded-base border border-slate-100">
                        "{req.message}"
                      </p>
                    )}

                    <div className="text-[11px] text-slate-400 tabular-nums">
                      Submitted on {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'pending' ? (
                      user?.role === 'alumni' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'accepted')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-base transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'declined')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-base transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 rounded-pill border border-amber-200">
                          <Clock className="w-3 h-3" />
                          <span>Pending Response</span>
                        </span>
                      )
                    ) : req.status === 'accepted' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-pill border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accepted</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-800 bg-red-50 rounded-pill border border-red-200">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Declined</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Send Request Modal */}
      {selectedTargetAlumni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-card shadow-layer3 border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm">
                Request Mentorship: {selectedTargetAlumni.name || selectedTargetAlumni.user?.fullName}
              </h3>
              <button
                onClick={() => setSelectedTargetAlumni(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="p-6 space-y-4">
              {requestSuccessMessage ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-base text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{requestSuccessMessage}</span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
                      Introduction & Questions *
                    </label>
                    <textarea
                      rows={4}
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Hi! I am a student at the institution and would love your guidance on preparing for roles in your domain..."
                      required
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-base text-slate-900 focus:outline-hidden focus:border-teal-600"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedTargetAlumni(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-base"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingRequest}
                      className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-base shadow-sm disabled:opacity-50"
                    >
                      {sendingRequest ? 'Submitting...' : 'Send Request'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
