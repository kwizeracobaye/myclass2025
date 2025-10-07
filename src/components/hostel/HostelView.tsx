import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Home, Users, UserCheck, UserX, Filter, Search } from 'lucide-react';

interface House {
  id: string;
  house_name: string;
  house_number: number;
  description: string;
}

interface Room {
  id: string;
  house_id: string;
  room_number: string;
  capacity: number;
  status: 'available' | 'occupied';
  hostel_houses: { house_name: string };
}

interface Occupant {
  id: string;
  room_id: string;
  staff_id: string;
  occupant_name: string;
  gender: 'male' | 'female';
  subject_teaching: string;
  year_level: string;
  check_in_date: string;
  check_out_date: string | null;
  status: 'checked_in' | 'checked_out';
  notes: string;
  hostel_rooms: {
    room_number: string;
    hostel_houses: { house_name: string };
  };
}

export const HostelView: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [occupants, setOccupants] = useState<Occupant[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOccupantModal, setShowOccupantModal] = useState(false);
  const [editingOccupant, setEditingOccupant] = useState<Occupant | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [housesRes, roomsRes, occupantsRes, staffRes] = await Promise.all([
        supabase.from('hostel_houses').select('*').order('house_number'),
        supabase.from('hostel_rooms').select('*, hostel_houses(house_name)').order('room_number'),
        supabase.from('hostel_occupants').select(`
          *,
          hostel_rooms(
            room_number,
            hostel_houses(house_name)
          )
        `).order('check_in_date', { ascending: false }),
        supabase.from('staff').select('id, staff_id, full_name').order('full_name'),
      ]);

      if (housesRes.data) setHouses(housesRes.data);
      if (roomsRes.data) setRooms(roomsRes.data as any);
      if (occupantsRes.data) setOccupants(occupantsRes.data as any);
      if (staffRes.data) setStaff(staffRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOccupant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const roomId = formData.get('room_id') as string;
    const occupantData = {
      room_id: roomId,
      staff_id: formData.get('staff_id') as string || null,
      occupant_name: formData.get('occupant_name') as string,
      gender: formData.get('gender') as string,
      subject_teaching: formData.get('subject_teaching') as string,
      year_level: formData.get('year_level') as string,
      check_in_date: formData.get('check_in_date') as string,
      check_out_date: formData.get('check_out_date') as string || null,
      status: formData.get('status') as string,
      notes: formData.get('notes') as string,
    };

    try {
      if (editingOccupant) {
        await supabase
          .from('hostel_occupants')
          .update(occupantData)
          .eq('id', editingOccupant.id);
      } else {
        await supabase.from('hostel_occupants').insert([occupantData]);
      }

      const newStatus = occupantData.status === 'checked_in' ? 'occupied' : 'available';
      await supabase.from('hostel_rooms').update({ status: newStatus }).eq('id', roomId);

      setShowOccupantModal(false);
      setEditingOccupant(null);
      loadData();
    } catch (error) {
      console.error('Error saving occupant:', error);
    }
  };

  const handleCheckOut = async (occupant: Occupant) => {
    if (!confirm(`Check out ${occupant.occupant_name}?`)) return;

    try {
      await supabase
        .from('hostel_occupants')
        .update({
          status: 'checked_out',
          check_out_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', occupant.id);

      await supabase
        .from('hostel_rooms')
        .update({ status: 'available' })
        .eq('id', occupant.room_id);

      loadData();
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  const handleDeleteOccupant = async (id: string, roomId: string) => {
    if (!confirm('Are you sure you want to delete this occupant record?')) return;

    try {
      await supabase.from('hostel_occupants').delete().eq('id', id);
      await supabase.from('hostel_rooms').update({ status: 'available' }).eq('id', roomId);
      loadData();
    } catch (error) {
      console.error('Error deleting occupant:', error);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    if (selectedHouse !== 'all' && room.house_id !== selectedHouse) return false;
    return true;
  });

  const filteredOccupants = occupants.filter((occ) => {
    if (filterGender !== 'all' && occ.gender !== filterGender) return false;
    if (filterStatus !== 'all' && occ.status !== filterStatus) return false;
    if (searchTerm && !occ.occupant_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !occ.subject_teaching.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const stats = {
    totalRooms: rooms.length,
    occupied: rooms.filter((r) => r.status === 'occupied').length,
    available: rooms.filter((r) => r.status === 'available').length,
    maleOccupants: occupants.filter((o) => o.status === 'checked_in' && o.gender === 'male').length,
    femaleOccupants: occupants.filter((o) => o.status === 'checked_in' && o.gender === 'female').length,
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
          <h2 className="text-3xl font-bold text-gray-900">Hostel Management</h2>
          <p className="text-gray-600 mt-1">Manage staff accommodation and room assignments</p>
        </div>
        <button
          onClick={() => {
            setEditingOccupant(null);
            setShowOccupantModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Check In Occupant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-3">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-lg p-3">
              <UserCheck className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">{stats.occupied}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-3">
              <UserX className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-100 rounded-lg p-3">
              <Users className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Male</p>
              <p className="text-2xl font-bold text-gray-900">{stats.maleOccupants}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 rounded-lg p-3">
              <Users className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Female</p>
              <p className="text-2xl font-bold text-gray-900">{stats.femaleOccupants}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Room Status by House</h3>
            <select
              value={selectedHouse}
              onChange={(e) => setSelectedHouse(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Houses</option>
              {houses.map((house) => (
                <option key={house.id} value={house.id}>
                  {house.house_name}
                </option>
              ))}
            </select>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {houses.map((house) => {
              const houseRooms = filteredRooms.filter((r) => r.house_id === house.id);
              if (selectedHouse !== 'all' && selectedHouse !== house.id) return null;

              return (
                <div key={house.id} className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">{house.house_name}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {houseRooms.map((room) => (
                      <div
                        key={room.id}
                        className={`p-3 rounded-lg border-2 text-center ${
                          room.status === 'occupied'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-green-50 border-green-200 text-green-700'
                        }`}
                      >
                        <div className="font-semibold">{room.room_number}</div>
                        <div className="text-xs mt-1 capitalize">{room.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Current Occupants</h3>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {filteredOccupants.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No occupants found</p>
            ) : (
              <div className="space-y-3">
                {filteredOccupants.map((occupant) => (
                  <div
                    key={occupant.id}
                    className={`p-3 rounded-lg border ${
                      occupant.status === 'checked_in'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{occupant.occupant_name}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            occupant.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                          }`}>
                            {occupant.gender}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            occupant.status === 'checked_in' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {occupant.status === 'checked_in' ? 'Checked In' : 'Checked Out'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {occupant.hostel_rooms.hostel_houses.house_name} - {occupant.hostel_rooms.room_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          Teaching: {occupant.subject_teaching} {occupant.year_level}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Check-in: {new Date(occupant.check_in_date).toLocaleDateString()}
                          {occupant.check_out_date && ` | Check-out: ${new Date(occupant.check_out_date).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {occupant.status === 'checked_in' && (
                          <button
                            onClick={() => handleCheckOut(occupant)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                            title="Check Out"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingOccupant(occupant);
                            setShowOccupantModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOccupant(occupant.id, occupant.room_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showOccupantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingOccupant ? 'Edit Occupant' : 'Check In New Occupant'}
            </h3>
            <form onSubmit={handleSaveOccupant} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">House</label>
                  <select
                    onChange={(e) => {
                      const houseId = e.target.value;
                      setSelectedHouse(houseId);
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select House</option>
                    {houses.map((house) => (
                      <option key={house.id} value={house.id}>
                        {house.house_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                  <select
                    name="room_id"
                    defaultValue={editingOccupant?.room_id}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Room</option>
                    {rooms
                      .filter((r) => selectedHouse === 'all' || r.house_id === selectedHouse)
                      .map((room) => (
                        <option key={room.id} value={room.id} disabled={room.status === 'occupied' && room.id !== editingOccupant?.room_id}>
                          {room.hostel_houses.house_name} - {room.room_number} ({room.status})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link to Staff (Optional)</label>
                <select
                  name="staff_id"
                  defaultValue={editingOccupant?.staff_id || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Not linked to staff</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.staff_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupant Name</label>
                  <input
                    type="text"
                    name="occupant_name"
                    defaultValue={editingOccupant?.occupant_name}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    defaultValue={editingOccupant?.gender}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Teaching</label>
                  <input
                    type="text"
                    name="subject_teaching"
                    defaultValue={editingOccupant?.subject_teaching}
                    placeholder="e.g., Mathematics"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year/Level</label>
                  <input
                    type="text"
                    name="year_level"
                    defaultValue={editingOccupant?.year_level}
                    placeholder="e.g., Year 3"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    name="check_in_date"
                    defaultValue={editingOccupant?.check_in_date || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date (Optional)</label>
                  <input
                    type="date"
                    name="check_out_date"
                    defaultValue={editingOccupant?.check_out_date || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={editingOccupant?.status || 'checked_in'}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  defaultValue={editingOccupant?.notes}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes or remarks"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowOccupantModal(false);
                    setEditingOccupant(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingOccupant ? 'Update' : 'Check In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
