import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MessageCircle, Send } from 'lucide-react';

export const ChatbotView: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('chatbot_messages')
      .select('*')
      .order('created_at', { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  const updateResponse = async (id: string, response: string) => {
    await supabase.from('chatbot_messages').update({ response, status: 'answered' }).eq('id', id);
    loadMessages();
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const pending = messages.filter((m) => m.status === 'pending');
  const answered = messages.filter((m) => m.status === 'answered');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Chatbot Messages</h2>
        <p className="text-gray-600 mt-1">Student inquiries and feedback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-orange-700 mb-4">Pending ({pending.length})</h3>
          <div className="space-y-4">
            {pending.map((msg) => (
              <div key={msg.id} className="border-l-4 border-orange-500 pl-3 py-2">
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-orange-500 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{msg.user_name}</p>
                    <p className="text-sm text-gray-600 mt-1">{msg.message}</p>
                    {msg.user_email && (
                      <p className="text-xs text-gray-500 mt-1">{msg.user_email}</p>
                    )}
                    <button
                      onClick={() => {
                        const response = prompt('Enter response:');
                        if (response) updateResponse(msg.id, response);
                      }}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 mt-2 flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Respond
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-green-700 mb-4">Answered ({answered.length})</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {answered.map((msg) => (
              <div key={msg.id} className="border-l-4 border-green-500 pl-3 py-2">
                <p className="font-medium text-gray-900">{msg.user_name}</p>
                <p className="text-sm text-gray-600 mt-1">Q: {msg.message}</p>
                <p className="text-sm text-green-700 mt-2">A: {msg.response}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
