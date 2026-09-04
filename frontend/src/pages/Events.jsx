import React, { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Clock, School, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { eventApi } from '../api/client';

export const Events = () => {
  const { user, activeCollege } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventApi.getEvents();
      setEvents(res.data.data || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      await eventApi.createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        eventDate: new Date(eventDate).toISOString(),
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setEventDate('');
      fetchEvents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to publish event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-navy-950">Campus & Alumni Events</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Conclaves, homecoming gatherings, technical hackathons, and webinars for {activeCollege?.name}.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-base shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 text-teal-400" />
            <span>Create Campus Event</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <span>Retrieving scheduled events...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-card border border-slate-200 p-12 text-center shadow-layer1">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-display font-bold text-base text-navy-950">No events scheduled</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Check back later for annual reunions and departmental conclaves.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => {
            const dateObj = new Date(ev.eventDate);
            const month = dateObj.toLocaleString('default', { month: 'short' });
            const day = dateObj.getDate();
            const year = dateObj.getFullYear();
            const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={ev.id}
                className="bg-white rounded-card border border-slate-200 shadow-layer1 hover:shadow-layer2 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    {/* Calendar Badge */}
                    <div className="w-12 h-12 rounded-base bg-navy-900 text-white flex flex-col items-center justify-center shrink-0 border border-navy-800 shadow-xs">
                      <span className="text-[10px] uppercase font-bold tracking-micro text-teal-400">
                        {month}
                      </span>
                      <span className="text-base font-bold tabular-nums leading-none">{day}</span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-base text-navy-950 leading-snug">
                        {ev.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{year} • {time}</span>
                      </div>
                    </div>
                  </div>

                  {ev.description && (
                    <p className="text-xs text-slate-600 mt-4 line-clamp-3 leading-relaxed">
                      {ev.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Organized by {ev.createdBy}</span>
                  <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-pill border border-teal-200">
                    Official Event
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Event Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-card shadow-layer3 border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm">Publish Collegiate Event</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Annual Global Alumni Conclave 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-base text-slate-900 focus:outline-hidden focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
                  Event Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-base text-slate-900 focus:outline-hidden focus:border-teal-600 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-micro mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Details about keynote speakers, location, venue, agenda..."
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
                  className="px-5 py-2 text-xs font-semibold bg-navy-900 hover:bg-navy-800 text-white rounded-base shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
