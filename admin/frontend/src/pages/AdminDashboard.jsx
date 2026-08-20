import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/contact');
      setMessages(data);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError('Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/contact/${id}/read`);
      setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, read: true } : m)));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/contact/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-orange">Messages</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-orange text-orange hover:bg-orange hover:text-black transition-colors"
          >
            Log Out
          </button>
        </div>

        {loading && <p>Loading messages...</p>}
        {error && <p className="text-rose">{error}</p>}
        {!loading && !error && messages.length === 0 && <p>No messages yet.</p>}

        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`p-4 sm:p-5 rounded-xl border ${
                m.read ? 'border-white/10 bg-white/5' : 'border-orange bg-orange/10'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-white/60">{m.email}</p>
                </div>
                <p className="text-xs text-white/40">
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>

              <p className="whitespace-pre-wrap text-white/90 mb-3">{m.message}</p>

              <div className="flex gap-3">
                {!m.read && (
                  <button
                    onClick={() => markAsRead(m._id)}
                    className="text-sm px-3 py-1.5 rounded-md bg-cyan/20 text-cyan hover:bg-cyan/30 transition-colors"
                  >
                    Mark as read
                  </button>
                )}
                <button
                  onClick={() => deleteMessage(m._id)}
                  className="text-sm px-3 py-1.5 rounded-md bg-rose/20 text-rose hover:bg-rose/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;