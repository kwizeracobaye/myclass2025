import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X } from 'lucide-react';

interface MedicalRecord {
  id: string;
  student_id: string;
  illness_description: string;
  treatment_type: 'in-school' | 'external';
  status: 'active' | 'recovering' | 'discharged';
  check_in_date: string;
  check_out_date: string | null;
  notes: string | null;
  students: { full_name: string; student_id: string } | null;
}

export const MedicalView: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    illness_description: '',
    treatment_type: 'in-school' as const,
    status: 'active' as const,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recordsRes, studentsRes] = await Promise.all([
        supabase
          .from('medical_records')
          .select('*, students(full_name, student_id)')
          .order('check_in_date', { ascending: false }),
        supabase.from('students').select('id, full_name, student_id'),
      ]);

      setRecords(recordsRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await supabase.from('medical_records').insert([formData]);
      setShowModal(false);
      setFormData({
        student_id: '',
        illness_description: '',
        treatment_type: 'in-school',
        status: 'active',
        notes: '',
      });
      loadData();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, checkOut: boolean = false) => {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (checkOut) {
      updateData.check_out_date = new Date().toISOString();
    }
    await supabase.from('medical_records').update(updateData).eq('id', id);
    loadData();
  };

  if (loading && records.length === 0) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const activeRecords = records.filter((r) => r.status === 'active');
  const recoveringRecords = records.filter((r) => r.status === 'recovering');
  const dischargedRecords = records.filter((r) => r.status === 'discharged');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Medical Records</h2>
          <p className="text-gray-600 mt-1">Track student health status</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Record
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-4">Active Cases ({activeRecords.length})</h3>
          <div className="space-y-3">
            {activeRecords.map((record) => (
              <div key={record.id} className="border-l-4 border-red-500 pl-3 py-2">
                <p className="font-medium text-gray-900">{record.students?.full_name}</p>
                <p className="text-sm text-gray-600">{record.illness_description}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{record.treatment_type}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => updateStatus(record.id, 'recovering')}
                    className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                  >
                    Set Recovering
                  </button>
                  <button
                    onClick={() => updateStatus(record.id, 'discharged', true)}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                  >
                    Discharge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-yellow-700 mb-4">Recovering ({recoveringRecords.length})</h3>
          <div className="space-y-3">
            {recoveringRecords.map((record) => (
              <div key={record.id} className="border-l-4 border-yellow-500 pl-3 py-2">
                <p className="font-medium text-gray-900">{record.students?.full_name}</p>
                <p className="text-sm text-gray-600">{record.illness_description}</p>
                <button
                  onClick={() => updateStatus(record.id, 'discharged', true)}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 mt-2"
                >
                  Discharge
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Discharged ({dischargedRecords.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {dischargedRecords.map((record) => (
              <div key={record.id} className="border-l-4 border-green-500 pl-3 py-2">
                <p className="font-medium text-gray-900">{record.students?.full_name}</p>
                <p className="text-sm text-gray-600">{record.illness_description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Checked out: {new Date(record.check_out_date!).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">New Medical Record</h3>
              <button onClick={() => setShowModal(false)}><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                <select
                  required
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.student_id} - {s.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Illness Description *</label>
                <textarea
                  required
                  value={formData.illness_description}
                  onChange={(e) => setFormData({ ...formData, illness_description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Type *</label>
                <select
                  value={formData.treatment_type}
                  onChange={(e) => setFormData({ ...formData, treatment_type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="in-school">In-School</option>
                  <option value="external">External Hospital</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
