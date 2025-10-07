import React from 'react';
import { Home, Users, CircleUser as UserCircle, Building2, DoorOpen, Activity, Package, Plane, Bell, MessageCircle, BarChart, AlertTriangle, Hotel, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { profile, signOut } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, forAdmin: false },
    ...(isAdmin ? [
      { id: 'students', label: 'Students', icon: Users, forAdmin: true },
      { id: 'colleges', label: 'Colleges & Faculties', icon: Building2, forAdmin: true },
      { id: 'incidents', label: 'Student Incidents', icon: AlertTriangle, forAdmin: true },
      { id: 'hostel', label: 'Hostel Management', icon: Hotel, forAdmin: true },
      { id: 'staff', label: 'Staff', icon: UserCircle, forAdmin: true },
      { id: 'rooms', label: 'Lecture Rooms', icon: DoorOpen, forAdmin: true },
      { id: 'medical', label: 'Medical Records', icon: Activity, forAdmin: true },
      { id: 'materials', label: 'Materials', icon: Package, forAdmin: true },
      { id: 'practice', label: 'External Practice', icon: Plane, forAdmin: true },
      { id: 'announcements', label: 'Announcements', icon: Bell, forAdmin: true },
      { id: 'chatbot', label: 'Chatbot', icon: MessageCircle, forAdmin: true },
      { id: 'reports', label: 'Reports', icon: BarChart, forAdmin: true },
    ] : []),
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">MyClass</h1>
        <p className="text-gray-400 text-sm mt-1">Academic Management</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="mb-3 px-4">
          <p className="text-sm font-medium">{profile?.full_name}</p>
          <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
