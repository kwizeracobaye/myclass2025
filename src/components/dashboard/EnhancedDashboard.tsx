import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, UserCircle, Building2, DoorOpen, Activity, Package, Plane, Bell, MessageCircle, BarChart } from 'lucide-react';

interface Stats {
  totalStudents: number;
  totalStaff: number;
  totalColleges: number;
  availableRooms: number;
  activePatients: number;
  lowStockItems: number;
  upcomingPractice: number;
  pendingMessages: number;
}

interface DashboardCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon: Icon, color, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:scale-105 text-left w-full"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`${color} rounded-lg p-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </button>
);

interface EnhancedDashboardProps {
  onNavigate: (view: string) => void;
}

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalStaff: 0,
    totalColleges: 0,
    availableRooms: 0,
    activePatients: 0,
    lowStockItems: 0,
    upcomingPractice: 0,
    pendingMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [
        studentsRes,
        staffRes,
        collegesRes,
        roomsRes,
        medicalRes,
        materialsRes,
        practiceRes,
        messagesRes,
      ] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('staff').select('id', { count: 'exact', head: true }),
        supabase.from('colleges').select('id', { count: 'exact', head: true }),
        supabase.from('lecture_rooms').select('status').eq('status', 'available'),
        supabase.from('medical_records').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('materials').select('id', { count: 'exact', head: true }).eq('status', 'low_stock'),
        supabase.from('external_practice_sessions').select('id', { count: 'exact', head: true }).eq('status', 'planned'),
        supabase.from('chatbot_messages').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        totalStudents: studentsRes.count || 0,
        totalStaff: staffRes.count || 0,
        totalColleges: collegesRes.count || 0,
        availableRooms: roomsRes.data?.length || 0,
        activePatients: medicalRes.count || 0,
        lowStockItems: materialsRes.count || 0,
        upcomingPractice: practiceRes.count || 0,
        pendingMessages: messagesRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const cards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500', view: 'students' },
    { title: 'Colleges', value: stats.totalColleges, icon: Building2, color: 'bg-purple-500', view: 'colleges' },
    { title: 'Staff Members', value: stats.totalStaff, icon: UserCircle, color: 'bg-green-500', view: 'staff' },
    { title: 'Available Rooms', value: stats.availableRooms, icon: DoorOpen, color: 'bg-teal-500', view: 'rooms' },
    { title: 'Active Medical Cases', value: stats.activePatients, icon: Activity, color: 'bg-red-500', view: 'medical' },
    { title: 'Low Stock Items', value: stats.lowStockItems, icon: Package, color: 'bg-orange-500', view: 'materials' },
    { title: 'Upcoming Practice', value: stats.upcomingPractice, icon: Plane, color: 'bg-indigo-500', view: 'practice' },
    { title: 'Pending Messages', value: stats.pendingMessages, icon: MessageCircle, color: 'bg-pink-500', view: 'chatbot' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome to MyClass Academic Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <DashboardCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            onClick={() => onNavigate(card.view)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <button
          onClick={() => onNavigate('announcements')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-500 rounded-lg p-2">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
          </div>
          <p className="text-gray-600 text-sm">View and manage system announcements</p>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all text-left"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-700 rounded-lg p-2">
              <BarChart className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Reports & Export</h3>
          </div>
          <p className="text-gray-600 text-sm">Generate Excel and PDF reports</p>
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-8 text-white">
        <h3 className="text-2xl font-bold mb-2">Quick Actions</h3>
        <p className="text-blue-100 mb-6">Click any card above to navigate to that section and manage records</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.totalStudents}</div>
            <div className="text-sm text-blue-100">Students</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.totalStaff}</div>
            <div className="text-sm text-blue-100">Staff</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.totalColleges}</div>
            <div className="text-sm text-blue-100">Colleges</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.availableRooms}</div>
            <div className="text-sm text-blue-100">Available Rooms</div>
          </div>
        </div>
      </div>
    </div>
  );
};
