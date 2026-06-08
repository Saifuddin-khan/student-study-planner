import { useEffect, useState } from 'react';
import API from '../api/axios';
import { FiBell, FiTrash2, FiCheck, FiFilter } from 'react-icons/fi';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetch = async () => {
    try {
      const res = await API.get('/api/notifications');
      setNotifications(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    await API.patch(`/api/notifications/${id}/read`);
    fetch();
  };

  const deleteNotif = async (id) => {
    await API.delete(`/api/notifications/${id}`);
    fetch();
  };

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const typeColor = (type) => {
    if (type?.includes('TASK')) return 'bg-blue-100 text-blue-600';
    if (type?.includes('GOAL')) return 'bg-green-100 text-green-600';
    if (type?.includes('ALERT')) return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiBell />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{unreadCount} unread</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            All
          </button>
          <button onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${filter === 'unread' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            Unread
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center h-40 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FiBell className="text-5xl text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-lg">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => (
            <div key={n.id} className={`bg-white rounded-xl p-4 shadow-sm border flex gap-3 items-start transition ${!n.read ? 'border-indigo-100 bg-indigo-50/30' : 'border-gray-100'}`}>
              <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-indigo-500' : 'bg-gray-200'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`font-medium text-sm ${!n.read ? 'text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!n.read && (
                      <button onClick={() => markRead(n.id)} className="p-1.5 text-gray-400 hover:text-green-500 transition" title="Mark as read">
                        <FiCheck className="text-sm" />
                      </button>
                    )}
                    <button onClick={() => deleteNotif(n.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition">
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor(n.type)}`}>
                    {n.type?.replace('_', ' ')}
                  </span>
                  {n.createdAt && (
                    <span className="text-xs text-gray-300">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
