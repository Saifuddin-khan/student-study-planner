import { useEffect, useState } from 'react';
import API from '../api/axios';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiCheckCircle, FiCircle, FiTarget } from 'react-icons/fi';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', targetDate: '' });

  const fetch = async () => {
    try {
      const res = await API.get('/api/goals');
      setGoals(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditGoal(null);
    setForm({ title: '', description: '', targetDate: '' });
    setShowForm(true);
  };

  const openEdit = (g) => {
    setEditGoal(g);
    setForm({ title: g.title, description: g.description || '', targetDate: g.targetDate || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editGoal) await API.put(`/api/goals/${editGoal.id}`, form);
      else await API.post('/api/goals', form);
      setShowForm(false);
      fetch();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const toggleComplete = async (g) => {
    await API.put(`/api/goals/${g.id}/status?completed=${!g.completed}`);
    fetch();
  };

  const deleteGoal = async (id) => {
    if (!confirm('Delete this goal?')) return;
    await API.delete(`/api/goals/${id}`);
    fetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-500 text-sm mt-1">{goals.filter(g => !g.completed).length} active goals</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
          <FiPlus /> New Goal
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editGoal ? 'Edit Goal' : 'New Goal'}</h2>
              <button onClick={() => setShowForm(false)}><FiX className="text-gray-400 text-xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Goal title" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3} placeholder="Describe your goal" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                <input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-medium">{editGoal ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center h-40 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FiTarget className="text-5xl text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-lg">No goals yet</p>
          <p className="text-gray-300 text-sm mt-1">Set a goal to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(g => (
            <div key={g.id} className={`bg-white rounded-2xl p-5 shadow-sm border flex flex-col gap-3 ${g.completed ? 'border-green-100 opacity-80' : 'border-gray-100'}`}>
              <div className="flex items-start gap-3">
                <button onClick={() => toggleComplete(g)} className="mt-0.5 shrink-0">
                  {g.completed
                    ? <FiCheckCircle className="text-green-500 text-xl" />
                    : <FiCircle className="text-gray-300 text-xl hover:text-indigo-400 transition" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-gray-900 ${g.completed ? 'line-through text-gray-400' : ''}`}>{g.title}</p>
                  {g.description && <p className="text-sm text-gray-500 mt-1">{g.description}</p>}
                  {g.targetDate && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs font-medium">
                      Target: {g.targetDate}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(g)} className="p-2 text-gray-400 hover:text-indigo-500 transition"><FiEdit2 /></button>
                  <button onClick={() => deleteGoal(g.id)} className="p-2 text-gray-400 hover:text-red-500 transition"><FiTrash2 /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
