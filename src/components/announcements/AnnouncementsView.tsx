import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Bell } from 'lucide-react';

export const AnnouncementsView: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Announcements</h2>
        <p className="text-gray-600 mt-1">System notifications and updates</p>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {announcement.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(announcement.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-12 text-gray-500">No announcements yet</div>
        )}
      </div>
    </div>
  );
};
