import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { EnhancedDashboard } from './components/dashboard/EnhancedDashboard';
import { StudentsView } from './components/students/StudentsView';
import { CollegesView } from './components/colleges/CollegesView';
import { IncidentsView } from './components/incidents/IncidentsView';
import { StaffView } from './components/staff/StaffView';
import { RoomsView } from './components/rooms/RoomsView';
import { MedicalView } from './components/medical/MedicalView';
import { MaterialsView } from './components/materials/MaterialsView';
import { PracticeView } from './components/practice/PracticeView';
import { AnnouncementsView } from './components/announcements/AnnouncementsView';
import { ChatbotView } from './components/chatbot/ChatbotView';
import { ReportsView } from './components/reports/ReportsView';

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginForm />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <EnhancedDashboard onNavigate={setCurrentView} />;
      case 'students':
        return <StudentsView />;
      case 'colleges':
        return <CollegesView />;
      case 'incidents':
        return <IncidentsView />;
      case 'staff':
        return <StaffView />;
      case 'rooms':
        return <RoomsView />;
      case 'medical':
        return <MedicalView />;
      case 'materials':
        return <MaterialsView />;
      case 'practice':
        return <PracticeView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'chatbot':
        return <ChatbotView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 ml-64">
        <main className="p-8">{renderView()}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
