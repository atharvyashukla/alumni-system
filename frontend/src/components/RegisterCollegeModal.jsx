import React, { useState } from 'react';
import { X, School, Building2, Globe, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { collegeApi } from '../api/client';

export const RegisterCollegeModal = ({ isOpen, onClose, onCollegeCreated }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('College name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await collegeApi.create({
        name: name.trim(),
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        domain: domain.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onCollegeCreated(res.data.data);
        onClose();
        setName('');
        setCity('');
        setState('');
        setDomain('');
        setSuccess(false);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register college. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-card shadow-layer3 border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-teal-500" />
            <h3 className="font-display font-bold text-lg">Register New Institution</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-base"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-base bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-base bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-sm text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Institution successfully registered!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
              Institution Name *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Indian Institute of Technology Madras"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 transition-all text-slate-900"
              />
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
                City
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Chennai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 transition-all text-slate-900"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="e.g. Tamil Nadu"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 transition-all text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
              Campus Email Domain (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. iitm.ac.in"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-base focus:outline-hidden focus:border-teal-600 focus:ring-3 focus:ring-teal-600/15 transition-all text-slate-900"
              />
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Used to automatically recognize official student and faculty emails.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-base transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-base shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register College'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
