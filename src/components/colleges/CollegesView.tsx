import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, CreditCard as Edit2, Trash2, ChevronDown, ChevronRight, Users } from 'lucide-react';

interface College {
  id: string;
  college_name: string;
  description: string;
}

interface Faculty {
  id: string;
  faculty_name: string;
  college_id: string;
  description: string;
}

interface StudentStats {
  total: number;
  male: number;
  female: number;
  repeat: number;
  dismissed: number;
  medical: number;
}

interface YearStats {
  year: number;
  stats: StudentStats;
}

export const CollegesView: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [expandedColleges, setExpandedColleges] = useState<Set<string>>(new Set());
  const [expandedFaculties, setExpandedFaculties] = useState<Set<string>>(new Set());
  const [yearStats, setYearStats] = useState<Record<string, YearStats[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [selectedCollegeForFaculty, setSelectedCollegeForFaculty] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [collegesRes, facultiesRes] = await Promise.all([
        supabase.from('colleges').select('*').order('college_name'),
        supabase.from('faculties').select('*').order('faculty_name'),
      ]);

      if (collegesRes.data) setColleges(collegesRes.data);
      if (facultiesRes.data) setFaculties(facultiesRes.data);

      await loadStudentStats();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentStats = async () => {
    try {
      const { data: students } = await supabase
        .from('students')
        .select('faculty_id, year, gender, incident_type');

      if (!students) return;

      const statsByFaculty: Record<string, YearStats[]> = {};

      students.forEach((student) => {
        if (!student.faculty_id || !student.year) return;

        if (!statsByFaculty[student.faculty_id]) {
          statsByFaculty[student.faculty_id] = [];
        }

        let yearStat = statsByFaculty[student.faculty_id].find((s) => s.year === student.year);
        if (!yearStat) {
          yearStat = {
            year: student.year,
            stats: { total: 0, male: 0, female: 0, repeat: 0, dismissed: 0, medical: 0 },
          };
          statsByFaculty[student.faculty_id].push(yearStat);
        }

        yearStat.stats.total++;
        if (student.gender === 'male') yearStat.stats.male++;
        if (student.gender === 'female') yearStat.stats.female++;
        if (student.incident_type === 'repeat') yearStat.stats.repeat++;
        if (student.incident_type === 'dismissed') yearStat.stats.dismissed++;
        if (student.incident_type === 'medical_discharge') yearStat.stats.medical++;
      });

      Object.keys(statsByFaculty).forEach((facultyId) => {
        statsByFaculty[facultyId].sort((a, b) => a.year - b.year);
      });

      setYearStats(statsByFaculty);
    } catch (error) {
      console.error('Error loading student stats:', error);
    }
  };

  const toggleCollege = (collegeId: string) => {
    const newExpanded = new Set(expandedColleges);
    if (newExpanded.has(collegeId)) {
      newExpanded.delete(collegeId);
    } else {
      newExpanded.add(collegeId);
    }
    setExpandedColleges(newExpanded);
  };

  const toggleFaculty = (facultyId: string) => {
    const newExpanded = new Set(expandedFaculties);
    if (newExpanded.has(facultyId)) {
      newExpanded.delete(facultyId);
    } else {
      newExpanded.add(facultyId);
    }
    setExpandedFaculties(newExpanded);
  };

  const handleSaveCollege = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const collegeData = {
      college_name: formData.get('college_name') as string,
      description: formData.get('description') as string,
    };

    try {
      if (editingCollege) {
        await supabase
          .from('colleges')
          .update(collegeData)
          .eq('id', editingCollege.id);
      } else {
        await supabase.from('colleges').insert([collegeData]);
      }

      setShowCollegeModal(false);
      setEditingCollege(null);
      loadData();
    } catch (error) {
      console.error('Error saving college:', error);
    }
  };

  const handleSaveFaculty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const facultyData = {
      faculty_name: formData.get('faculty_name') as string,
      college_id: formData.get('college_id') as string,
      description: formData.get('description') as string,
    };

    try {
      if (editingFaculty) {
        await supabase
          .from('faculties')
          .update(facultyData)
          .eq('id', editingFaculty.id);
      } else {
        await supabase.from('faculties').insert([facultyData]);
      }

      setShowFacultyModal(false);
      setEditingFaculty(null);
      loadData();
    } catch (error) {
      console.error('Error saving faculty:', error);
    }
  };

  const handleDeleteCollege = async (id: string) => {
    if (!confirm('Are you sure you want to delete this college? All associated faculties will also be deleted.')) return;

    try {
      await supabase.from('colleges').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error deleting college:', error);
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty?')) return;

    try {
      await supabase.from('faculties').delete().eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error deleting faculty:', error);
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
          <h2 className="text-3xl font-bold text-gray-900">Colleges & Faculties</h2>
          <p className="text-gray-600 mt-1">Manage academic structure and view student statistics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditingCollege(null);
              setShowCollegeModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add College
          </button>
          <button
            onClick={() => {
              setEditingFaculty(null);
              setSelectedCollegeForFaculty('');
              setShowFacultyModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-5 h-5" />
            Add Faculty
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {colleges.map((college) => {
          const collegeFaculties = faculties.filter((f) => f.college_id === college.id);
          const isExpanded = expandedColleges.has(college.id);

          return (
            <div key={college.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 flex items-center justify-between bg-blue-50 rounded-t-lg">
                <div className="flex items-center gap-3 flex-1">
                  <button onClick={() => toggleCollege(college.id)} className="text-blue-600">
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{college.college_name}</h3>
                    {college.description && <p className="text-sm text-gray-600">{college.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {collegeFaculties.length} Faculties
                  </span>
                  <button
                    onClick={() => {
                      setEditingCollege(college);
                      setShowCollegeModal(true);
                    }}
                    className="p-2 text-gray-600 hover:bg-blue-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCollege(college.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 space-y-3">
                  {collegeFaculties.length === 0 ? (
                    <p className="text-gray-500 text-sm pl-8">No faculties in this college</p>
                  ) : (
                    collegeFaculties.map((faculty) => {
                      const isFacultyExpanded = expandedFaculties.has(faculty.id);
                      const facultyYearStats = yearStats[faculty.id] || [];

                      return (
                        <div key={faculty.id} className="border border-gray-200 rounded-lg">
                          <div className="p-3 flex items-center justify-between bg-gray-50 rounded-t-lg">
                            <div className="flex items-center gap-3 flex-1">
                              <button onClick={() => toggleFaculty(faculty.id)} className="text-gray-600">
                                {isFacultyExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                              <div>
                                <h4 className="font-semibold text-gray-800">{faculty.faculty_name}</h4>
                                {faculty.description && <p className="text-xs text-gray-600">{faculty.description}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingFaculty(faculty);
                                  setSelectedCollegeForFaculty(faculty.college_id);
                                  setShowFacultyModal(true);
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteFaculty(faculty.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {isFacultyExpanded && (
                            <div className="p-3">
                              {facultyYearStats.length === 0 ? (
                                <p className="text-gray-500 text-sm pl-6">No students enrolled</p>
                              ) : (
                                <div className="space-y-2">
                                  {facultyYearStats.map((yearStat) => (
                                    <div key={yearStat.year} className="bg-white border border-gray-200 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                          <Users className="w-4 h-4 text-blue-600" />
                                          Year {yearStat.year}
                                        </h5>
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
                                        <div className="bg-blue-50 p-2 rounded">
                                          <div className="text-xs text-gray-600">Total</div>
                                          <div className="font-bold text-blue-600">{yearStat.stats.total}</div>
                                        </div>
                                        <div className="bg-green-50 p-2 rounded">
                                          <div className="text-xs text-gray-600">Male</div>
                                          <div className="font-bold text-green-600">{yearStat.stats.male}</div>
                                        </div>
                                        <div className="bg-pink-50 p-2 rounded">
                                          <div className="text-xs text-gray-600">Female</div>
                                          <div className="font-bold text-pink-600">{yearStat.stats.female}</div>
                                        </div>
                                        <div className="bg-yellow-50 p-2 rounded">
                                          <div className="text-xs text-gray-600">Repeated</div>
                                          <div className="font-bold text-yellow-600">{yearStat.stats.repeat}</div>
                                        </div>
                                        <div className="bg-red-50 p-2 rounded">
                                          <div className="text-xs text-gray-600">Dismissed</div>
                                          <div className="font-bold text-red-600">{yearStat.stats.dismissed}</div>
                                        </div>
                                        <div className="bg-purple-50 p-2 rounded">
                                          <div className="text-xs text-gray-600">Medical</div>
                                          <div className="font-bold text-purple-600">{yearStat.stats.medical}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showCollegeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingCollege ? 'Edit College' : 'Add College'}</h3>
            <form onSubmit={handleSaveCollege} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                <input
                  type="text"
                  name="college_name"
                  defaultValue={editingCollege?.college_name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingCollege?.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCollegeModal(false);
                    setEditingCollege(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFacultyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingFaculty ? 'Edit Faculty' : 'Add Faculty'}</h3>
            <form onSubmit={handleSaveFaculty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Name</label>
                <input
                  type="text"
                  name="faculty_name"
                  defaultValue={editingFaculty?.faculty_name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                <select
                  name="college_id"
                  defaultValue={editingFaculty?.college_id || selectedCollegeForFaculty}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.id}>
                      {college.college_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingFaculty?.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowFacultyModal(false);
                    setEditingFaculty(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
