import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, CreditCard as Edit2, Trash2, Filter, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Incident {
  id: string;
  student_id: string;
  incident_type: 'repeat' | 'dismissed' | 'medical_discharge';
  incident_date: string;
  reason: string;
  notes: string;
  created_at: string;
  students: {
    student_id: string;
    full_name: string;
    faculty: string;
    year: number;
    colleges: { college_name: string };
    faculties: { faculty_name: string };
  };
}

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  faculty: string;
  college_id: string;
  faculty_id: string;
  year: number;
}

export const IncidentsView: React.FC = () => {
  const { profile } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [incidentsRes, studentsRes] = await Promise.all([
        supabase
          .from('student_incidents')
          .select(`
            *,
            students:student_id (
              student_id,
              full_name,
              faculty,
              year,
              colleges:college_id (college_name),
              faculties:faculty_id (faculty_name)
            )
          `)
          .order('incident_date', { ascending: false }),
        supabase.from('students').select('id, student_id, full_name, faculty, college_id, faculty_id, year').order('full_name'),
      ]);

      if (incidentsRes.data) setIncidents(incidentsRes.data as any);
      if (studentsRes.data) setStudents(studentsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIncident = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const incidentData = {
      student_id: formData.get('student_id') as string,
      incident_type: formData.get('incident_type') as string,
      incident_date: formData.get('incident_date') as string,
      reason: formData.get('reason') as string,
      notes: formData.get('notes') as string,
      reported_by: profile?.id,
    };

    try {
      if (editingIncident) {
        await supabase
          .from('student_incidents')
          .update(incidentData)
          .eq('id', editingIncident.id);

        await supabase
          .from('students')
          .update({ incident_type: incidentData.incident_type })
          .eq('id', incidentData.student_id);
      } else {
        await supabase.from('student_incidents').insert([incidentData]);

        await supabase
          .from('students')
          .update({ incident_type: incidentData.incident_type })
          .eq('id', incidentData.student_id);
      }

      setShowModal(false);
      setEditingIncident(null);
      setSelectedStudent(null);
      loadData();
    } catch (error) {
      console.error('Error saving incident:', error);
    }
  };

  const handleDeleteIncident = async (id: string) => {
    if (!confirm('Are you sure you want to delete this incident record?')) return;

    try {
      await supabase.from('student_incidents').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error deleting incident:', error);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    setSelectedStudent(student || null);
  };

  const filteredIncidents = filterType === 'all'
    ? incidents
    : incidents.filter((inc) => inc.incident_type === filterType);

  const getIncidentBadgeColor = (type: string) => {
    switch (type) {
      case 'repeat':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dismissed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medical_discharge':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIncidentLabel = (type: string) => {
    switch (type) {
      case 'repeat':
        return 'Repeat Year';
      case 'dismissed':
        return 'Dismissed';
      case 'medical_discharge':
        return 'Medical Discharge';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Student Incidents</h2>
          <p className="text-gray-600 mt-1">Track academic incidents including repeats, dismissals, and medical discharges</p>
        </div>
        <button
          onClick={() => {
            setEditingIncident(null);
            setSelectedStudent(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <Plus className="w-5 h-5" />
          Report Incident
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Filter by Type:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg border ${
              filterType === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            All ({incidents.length})
          </button>
          <button
            onClick={() => setFilterType('repeat')}
            className={`px-4 py-2 rounded-lg border ${
              filterType === 'repeat'
                ? 'bg-yellow-600 text-white border-yellow-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Repeat Year ({incidents.filter((i) => i.incident_type === 'repeat').length})
          </button>
          <button
            onClick={() => setFilterType('dismissed')}
            className={`px-4 py-2 rounded-lg border ${
              filterType === 'dismissed'
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Dismissed ({incidents.filter((i) => i.incident_type === 'dismissed').length})
          </button>
          <button
            onClick={() => setFilterType('medical_discharge')}
            className={`px-4 py-2 rounded-lg border ${
              filterType === 'medical_discharge'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Medical Discharge ({incidents.filter((i) => i.incident_type === 'medical_discharge').length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">College</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Incident Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No incidents recorded</p>
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{incident.students.full_name}</div>
                        <div className="text-sm text-gray-500">{incident.students.student_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {incident.students.colleges?.college_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {incident.students.faculties?.faculty_name || incident.students.faculty}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">Year {incident.students.year || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getIncidentBadgeColor(incident.incident_type)}`}>
                        {getIncidentLabel(incident.incident_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(incident.incident_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {incident.reason || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingIncident(incident);
                            setSelectedStudent(students.find((s) => s.id === incident.student_id) || null);
                            setShowModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteIncident(incident.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingIncident ? 'Edit Incident' : 'Report New Incident'}</h3>
            <form onSubmit={handleSaveIncident} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  name="student_id"
                  defaultValue={editingIncident?.student_id}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.full_name} ({student.student_id})
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-700">
                    <strong>Faculty:</strong> {selectedStudent.faculty} | <strong>Year:</strong> {selectedStudent.year}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type</label>
                <select
                  name="incident_type"
                  defaultValue={editingIncident?.incident_type}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="repeat">Repeat Year</option>
                  <option value="dismissed">Dismissed</option>
                  <option value="medical_discharge">Medical Discharge</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date</label>
                <input
                  type="date"
                  name="incident_date"
                  defaultValue={editingIncident?.incident_date || new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  name="reason"
                  defaultValue={editingIncident?.reason}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain the reason for this incident"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  name="notes"
                  defaultValue={editingIncident?.notes}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingIncident(null);
                    setSelectedStudent(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Save Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
