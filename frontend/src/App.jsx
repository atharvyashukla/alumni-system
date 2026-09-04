import React from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { CollegeSelector } from './pages/CollegeSelector';
import { RoleSelection } from './pages/RoleSelection';
import { StudentProfileForm } from './pages/StudentProfileForm';
import { AlumniProfileForm } from './pages/AlumniProfileForm';
import { MainApp } from './pages/MainApp';
import { School, Loader2 } from 'lucide-react';

export function App() {
  const { loading, stage } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-stitch-surface flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-card bg-navy-900 text-white flex items-center justify-center shadow-layer2 mb-4 border border-navy-800">
          <School className="w-6 h-6 text-teal-500" />
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
          <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
          <span>Synchronizing Collegiate Network Session...</span>
        </div>
      </div>
    );
  }

  switch (stage) {
    case 'unauthenticated':
      return <Login />;
    case 'needs_college':
      return <CollegeSelector />;
    case 'needs_role':
      return <RoleSelection />;
    case 'needs_student_profile':
      return <StudentProfileForm />;
    case 'needs_alumni_profile':
      return <AlumniProfileForm />;
    case 'ready':
      return <MainApp />;
    default:
      return <Login />;
  }
}

export default App;
