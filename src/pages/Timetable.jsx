import { useEffect, useState } from 'react';
import API from '../api/axios';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiCalendar } from 'react-icons/fi';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const SHORT = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' };

export default function Timetable() {
  const [slots, setSlots] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [showForm, setShowForm] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [form, setForm] = useState({ dayOfWeek: 'MONDAY', startTime: '', endTime: '', description: '', subjectId: '' });

  const fetch = async () => {
    try {
      const [ttRes, subjRes] = await Promise.all([
        API.get('/api/timetables'),
        API.get('/api/subjects'),
      ]);
      setSlots(ttRes.data);
      setSubjects(subjRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditSlot(null);
    setForm({ dayOfWeek: activeDay, startTime: '', endTime: '', description: '', subjectId: '' });
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditSlot(s);
    setForm({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, description: s.description || '', subjectId: s.subjectId || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, subjectId: form.subjectId ? Number(form.subjectId) : null };
    try {
      if (editSlot) await API.put(`/api/timetables/${editSlot.id}`, payload);
      else await API.post('/api/timetables', payload);
      setShowForm(false);
      fetch();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const deleteSlot = async (id) => {
    if (!confirm('Delete this slot?')) return;
    await API.delete(`/api/timetables/${id}`);
    fetch();
  };

  const daySlots = slots.filter(s => s.dayOfWeek === activeDay).sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-500 text-sm mt-1">Weekly class schedule</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
          <FiPlus /> Add Slot
        </button>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DAYS.map(day => (
          <button key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${activeDay === day ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {SHORT[day]}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editSlot ? 'Edit Slot' : 'New Slot'}</h2>
              <button onClick={() => setShowForm(false)}><FiX className="text-gray-400 text-xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input type="time" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input type="time" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}>
                  <option value="">None</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Online lecture, Lab session" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium">{editSlot ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center h-40 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : daySlots.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FiCalendar className="text-5xl text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No classes on {SHORT[activeDay]}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {daySlots.map(s => (
            <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="text-center bg-indigo-50 rounded-xl px-4 py-3 min-w-[90px]">
                <p className="text-xs text-indigo-400 font-medium">{s.startTime}</p>
                <div className="w-px h-4 bg-indigo-200 mx-auto my-1" />
                <p className="text-xs text-indigo-400 font-medium">{s.endTime}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{s.subjectName || 'Class'}</p>
                {s.description && <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-indigo-500 transition"><FiEdit2 /></button>
                <button onClick={() => deleteSlot(s.id)} className="p-2 text-gray-400 hover:text-red-500 transition"><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
