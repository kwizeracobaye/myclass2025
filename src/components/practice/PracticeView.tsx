import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plane } from 'lucide-react';

export const PracticeView: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const { data } = await supabase
      .from('external_practice_sessions')
      .select('*')
      .order('date', { ascending: true });
    setSessions(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('external_practice_sessions').update({ status }).eq('id', id);
    loadSessions();
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const planned = sessions.filter((s) => s.status === 'planned');
  const inProgress = sessions.filter((s) => s.status === 'in-progress');
  const completed = sessions.filter((s) => s.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">External Practice Sessions</h2>
        <p className="text-gray-600 mt-1">Track field work and practical sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-4">Planned ({planned.length})</h3>
          <div className="space-y-3">
            {planned.map((session) => (
              <div key={session.id} className="border-l-4 border-blue-500 pl-3 py-2">
                <div className="flex items-start gap-2">
                  <Plane className="w-4 h-4 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{session.session_name}</p>
                    <p className="text-sm text-gray-600">{session.location}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.date).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => updateStatus(session.id, 'in-progress')}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 mt-2"
                    >
                      Start Session
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-orange-700 mb-4">In Progress ({inProgress.length})</h3>
          <div className="space-y-3">
            {inProgress.map((session) => (
              <div key={session.id} className="border-l-4 border-orange-500 pl-3 py-2">
                <p className="font-medium text-gray-900">{session.session_name}</p>
                <p className="text-sm text-gray-600">{session.location}</p>
                <button
                  onClick={() => updateStatus(session.id, 'completed')}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 mt-2"
                >
                  Complete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Completed ({completed.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {completed.map((session) => (
              <div key={session.id} className="border-l-4 border-green-500 pl-3 py-2">
                <p className="font-medium text-gray-900">{session.session_name}</p>
                <p className="text-sm text-gray-600">{session.location}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(session.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
