import React from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  School,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, onSelectTab, isCollapsed, onToggleCollapse }) => {
  const { user, activeCollege } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'directory', label: 'Alumni Directory', icon: Users },
    { id: 'mentorship', label: 'AI Mentorship', icon: Sparkles },
    { id: 'events', label: 'Campus Events', icon: Calendar },
    { id: 'jobs', label: 'Job Board', icon: Briefcase },
    { id: 'donations', label: 'Giving & Funds', icon: HeartHandshake },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin Portal', icon: ShieldCheck });
  }

  return (
    <aside
      className={`bg-navy-900 border-r border-white/10 text-white flex flex-col justify-between transition-all duration-300 z-20 shrink-0 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-base bg-navy-800 border border-white/10 flex items-center justify-center shrink-0">
              <School className="w-5 h-5 text-teal-400" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="font-display font-bold text-sm leading-none truncate">
                  {activeCollege?.name || 'Alumni System'}
                </div>
                <div className="text-[10px] text-teal-400 uppercase tracking-micro mt-1 font-semibold">
                  Network Portal
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-base text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Routes */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-base text-xs font-semibold transition-all relative group ${
                  isActive
                    ? 'bg-white/10 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Stitch 3px Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-1 bg-teal-500 rounded-r-full" />
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-white'
                  }`}
                />

                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Tenant Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-white/10 bg-navy-950/40 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300 truncate">
            {activeCollege?.city ? `${activeCollege.city}, ${activeCollege.state || ''}` : 'Collegiate Network'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Multi-Tenant Scoped</div>
        </div>
      )}
    </aside>
  );
};
