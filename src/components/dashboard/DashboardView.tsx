import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, CircleUser as UserCircle, DoorOpen, Activity, Package, Plane } from 'lucide-react';

interface Stats {
  totalStudents: number;
  totalStaff: number;
  availableRooms: number;
  activePatients: number;
  lowStockItems: number;
  upcomingPractice: number;
  studentsByGender: { male: number; female: number; other: number };
  studentsByFaculty: Record<string, number>;
}

export const DashboardView: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalStaff: 0,
    availableRooms: 0,
    activePatients: 0,
    lowStockItems: 0,
    upcomingPractice: 0,
    studentsByGender: { male: 0, female: 0, other: 0 },
    studentsByFaculty: {},
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
        roomsRes,
        medicalRes,
        materialsRes,
        practiceRes,
      ] = await Promise.all([
        supabase.from('students').select('gender, faculty'),
        supabase.from('staff').select('id'),
        supabase.from('lecture_rooms').select('status'),
        supabase.from('medical_records').select('status').eq('status', 'active'),
        supabase.from('materials').select('status').eq('status', 'low_stock'),
        supabase.from('external_practice_sessions').select('status').eq('status', 'planned'),
      ]);

      const students = studentsRes.data || [];
      const genderStats = { male: 0, female: 0, other: 0 };
      const facultyStats: Record<string, number> = {};

      students.forEach((student) => {
        genderStats[student.gender as keyof typeof genderStats]++;
        facultyStats[student.faculty] = (facultyStats[student.faculty] || 0) + 1;
      });

      setStats({
        totalStudents: students.length,
        totalStaff: staffRes.data?.length || 0,
        availableRooms: roomsRes.data?.filter((r) => r.status === 'available').length || 0,
        activePatients: medicalRes.data?.length || 0,
        lowStockItems: materialsRes.data?.length || 0,
        upcomingPractice: practiceRes.data?.length || 0,
        studentsByGender: genderStats,
        studentsByFaculty: facultyStats,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Staff', value: stats.totalStaff, icon: UserCircle, color: 'bg-green-500' },
    { label: 'Available Rooms', value: stats.availableRooms, icon: DoorOpen, color: 'bg-teal-500' },
    { label: 'Active Patients', value: stats.activePatients, icon: Activity, color: 'bg-red-500' },
    { label: 'Low Stock Items', value: stats.lowStockItems, icon: Package, color: 'bg-orange-500' },
    { label: 'Upcoming Practice', value: stats.upcomingPractice, icon: Plane, color: 'bg-indigo-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Overview of academic support system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Gender</h3>
          <div className="space-y-3">
            {Object.entries(stats.studentsByGender).map(([gender, count]) => (
              <div key={gender} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">{gender}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Faculty</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {Object.entries(stats.studentsByFaculty).map(([faculty, count]) => (
              <div key={faculty} className="flex items-center justify-between">
                <span className="text-gray-700">{faculty}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
