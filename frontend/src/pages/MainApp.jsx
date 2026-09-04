import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { TopNavbar } from '../components/TopNavbar';
import { Dashboard } from './Dashboard';
import { Directory } from './Directory';
import { Mentorship } from './Mentorship';
import { Events } from './Events';
import { Jobs } from './Jobs';
import { Donations } from './Donations';
import { AdminPanel } from './AdminPanel';

export const MainApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedMentorForRequest, setSelectedMentorForRequest] = useState(null);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Network Intelligence Dashboard';
      case 'directory':
        return 'Collegiate Alumni Directory';
      case 'mentorship':
        return 'AI Mentorship & Guidance';
      case 'events':
        return 'Campus & Alumni Events';
      case 'jobs':
        return 'Collegiate Job & Internship Board';
      case 'donations':
        return 'Giving & University Endowments';
      case 'admin':
        return 'Institutional Administration Portal';
      default:
        return 'Collegiate Network';
    }
  };

  const handleRequestMentor = (alumni) => {
    setSelectedMentorForRequest(alumni);
    setActiveTab('mentorship');
  };

  return (
    <div className="flex h-screen bg-stitch-surface overflow-hidden">
      {/* Persistent Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar currentTabTitle={getTabTitle()} />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'directory' && (
            <Directory onRequestMentor={handleRequestMentor} />
          )}

          {activeTab === 'mentorship' && (
            <Mentorship preselectedMentor={selectedMentorForRequest} />
          )}

          {activeTab === 'events' && (
            <Events />
          )}

          {activeTab === 'jobs' && (
            <Jobs />
          )}

          {activeTab === 'donations' && (
            <Donations />
          )}

          {activeTab === 'admin' && (
            <AdminPanel />
          )}
        </main>
      </div>
    </div>
  );
};
