import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  Briefcase,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { directoryApi, donationApi, eventApi, jobApi } from '../api/client';

export const Dashboard = ({ onNavigateTab }) => {
  const { user, activeCollege } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAlumni: 0,
    verifiedAlumni: 0,
    totalFunds: 0,
    recentEvents: 0,
    recentJobs: 0,
  });

  const [sectorData, setSectorData] = useState([]);
  const [batchData, setBatchData] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch directory to compute sector and batch distribution
        const alumniRes = await directoryApi.getAlumni({ limit: 100 });
        const alumniList = alumniRes.data.data || [];

        // Count totals
        const totalAlumni = alumniRes.data.pagination?.total || alumniList.length;
        const verifiedCount = alumniList.filter((a) => a.isVerified).length;

        // Group by Sector
        const sectorCounts = {};
        const batchCounts = {};

        alumniList.forEach((a) => {
          const s = a.sector || 'Other';
          sectorCounts[s] = (sectorCounts[s] || 0) + 1;

          if (a.batchYear) {
            batchCounts[a.batchYear] = (batchCounts[a.batchYear] || 0) + 1;
          }
        });

        const formattedSectors = Object.keys(sectorCounts).map((key) => ({
          sector: key,
          count: sectorCounts[key],
        }));

        const formattedBatches = Object.keys(batchCounts)
          .sort()
          .map((year) => ({
            year: `Class of '${year.slice(-2)}`,
            count: batchCounts[year],
          }));

        // Fetch donations summary
        let funds = 0;
        try {
          const donRes = await donationApi.getSummary(activeCollege?.id);
          funds = donRes.data.summary?.totalAmount || 0;
        } catch (e) {
          // Fallback if no donations yet
        }

        // Fetch events & jobs count
        let eventsCount = 0;
        let jobsCount = 0;
        try {
          const [evRes, jbRes] = await Promise.all([eventApi.getEvents(), jobApi.getJobs()]);
          eventsCount = evRes.data.count || 0;
          jobsCount = jbRes.data.count || 0;
        } catch (e) {}

        setStats({
          totalAlumni,
          verifiedAlumni: verifiedCount,
          totalFunds: funds,
          recentEvents: eventsCount,
          recentJobs: jobsCount,
        });

        setSectorData(
          formattedSectors.length > 0
            ? formattedSectors
            : [
                { sector: 'IT/Software', count: 2 },
                { sector: 'Core Engineering', count: 1 },
                { sector: 'Higher Studies', count: 0 },
              ]
        );

        setBatchData(
          formattedBatches.length > 0
            ? formattedBatches
            : [
                { year: "'17", count: 1 },
                { year: "'18", count: 1 },
                { year: "'19", count: 1 },
              ]
        );
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [activeCollege]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-2 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
        <span>Aggregating institutional data metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-navy-900 text-white rounded-card p-6 shadow-layer2 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-navy-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-micro">
            <span>Institutional Data Intelligence</span>
            <span>•</span>
            <span className="text-slate-300">{activeCollege?.name}</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white mt-1">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time collegiate network metrics, verified alumni distribution, and career advancement telemetry.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('mentorship')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold rounded-base shadow-sm transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Launch AI Mentor Finder</span>
        </button>
      </div>

      {/* 4 Key Metric Roll Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Alumni */}
        <div className="bg-white rounded-card border border-slate-200 p-5 shadow-layer1 border-t-2 border-t-teal-600">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-micro text-slate-600">
              Total Alumni
            </span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="font-display font-bold text-2xl text-navy-950 tabular-nums">
            {stats.totalAlumni}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Registered graduates in network</p>
        </div>

        {/* Card 2: Verified Alumni */}
        <div className="bg-white rounded-card border border-slate-200 p-5 shadow-layer1 border-t-2 border-t-teal-600">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-micro text-slate-600">
              Verified Alumni
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display font-bold text-2xl text-emerald-700 tabular-nums">
            {stats.verifiedAlumni}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Official credentials audited</p>
        </div>

        {/* Card 3: Active Jobs & Events */}
        <div className="bg-white rounded-card border border-slate-200 p-5 shadow-layer1 border-t-2 border-t-teal-600">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-micro text-slate-600">
              Opportunities & Events
            </span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-display font-bold text-2xl text-navy-950 tabular-nums">
            {stats.recentJobs + stats.recentEvents}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active jobs, internships & conclaves</p>
        </div>

        {/* Card 4: Total Donations */}
        <div className="bg-white rounded-card border border-slate-200 p-5 shadow-layer1 border-t-2 border-t-teal-600">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-micro text-slate-600">
              Endowment & Giving
            </span>
            <HeartHandshake className="w-4 h-4 text-teal-600" />
          </div>
          <div className="font-display font-bold text-2xl text-navy-950 tabular-nums">
            ₹{stats.totalFunds.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Contributed toward scholarships & labs</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Sector Distribution (BarChart) */}
        <div className="bg-white rounded-card border border-slate-200 shadow-layer1 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-navy-950">
                Alumni Employment by Sector
              </h3>
              <p className="text-xs text-slate-500">Distribution across major market industries</p>
            </div>
            <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-pill border border-teal-200">
              Live Registry
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="sector"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  itemStyle={{ color: '#86F2E4' }}
                />
                <Bar dataKey="count" fill="#0D9488" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Batch Year Growth (AreaChart) */}
        <div className="bg-white rounded-card border border-slate-200 shadow-layer1 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-navy-950">
                Graduation Batch Rollups
              </h3>
              <p className="text-xs text-slate-500">Alumni density over graduation eras</p>
            </div>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={batchData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="batchGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A2540" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0A2540" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A2540',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  itemStyle={{ color: '#B0C8EB' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#0A2540"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#batchGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigateTab('directory')}
          className="bg-white p-5 rounded-card border border-slate-200 shadow-layer1 hover:shadow-layer2 hover:border-slate-300 transition-all text-left flex items-center justify-between group"
        >
          <div>
            <h4 className="font-display font-bold text-sm text-navy-950 group-hover:text-teal-700 transition-colors">
              Explore Alumni Directory
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Search verified alumni across companies</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
        </button>

        <button
          onClick={() => onNavigateTab('jobs')}
          className="bg-white p-5 rounded-card border border-slate-200 shadow-layer1 hover:shadow-layer2 hover:border-slate-300 transition-all text-left flex items-center justify-between group"
        >
          <div>
            <h4 className="font-display font-bold text-sm text-navy-950 group-hover:text-teal-700 transition-colors">
              Browse Job & Internship Board
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Opportunities shared by alumni network</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
        </button>

        <button
          onClick={() => onNavigateTab('donations')}
          className="bg-white p-5 rounded-card border border-slate-200 shadow-layer1 hover:shadow-layer2 hover:border-slate-300 transition-all text-left flex items-center justify-between group"
        >
          <div>
            <h4 className="font-display font-bold text-sm text-navy-950 group-hover:text-teal-700 transition-colors">
              Giving & Top 10 Leaderboard
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">Support institutional innovation initiatives</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
        </button>
      </div>
    </div>
  );
};
