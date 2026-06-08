import { useEffect, useState } from 'react';
import API from '../api/axios';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiBook } from 'react-icons/fi';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', colorCode: COLORS[0] });

  const fetch = async () => {
    try {
      const res = await API.get('/api/subjects');
      setSubjects(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditSubject(null);
    setForm({ name: '', description: '', colorCode: COLORS[0] });
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditSubject(s);
    setForm({ name: s.name, description: s.description || '', colorCode: s.colorCode || COLORS[0] });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editSubject) await API.put(`/api/subjects/${editSubject.id}`, form);
      else await API.post('/api/subjects', form);
      setShowForm(false);
      fetch();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const deleteSubject = async (id) => {
    if (!confirm('Delete this subject?')) return;
    await API.delete(`/api/subjects/${id}`);
    fetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-500 text-sm mt-1">{subjects.length} subjects</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
          <FiPlus /> Add Subject
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editSubject ? 'Edit Subject' : 'New Subject'}</h2>
              <button onClick={() => setShowForm(false)}><FiX className="text-gray-400 text-xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Mathematics" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={2} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button key={c} type="button"
                      onClick={() => setForm({ ...form, colorCode: c })}
                      className={`w-8 h-8 rounded-full transition ${form.colorCode === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium">{editSubject ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center h-40 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FiBook className="text-5xl text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-lg">No subjects yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(s => (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-2" style={{ backgroundColor: s.colorCode || '#6366f1' }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.colorCode || '#6366f1'}20` }}>
                      <FiBook style={{ color: s.colorCode || '#6366f1' }} className="text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{s.name}</p>
                      {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-indigo-500 transition"><FiEdit2 /></button>
                    <button onClick={() => deleteSubject(s.id)} className="p-2 text-gray-400 hover:text-red-500 transition"><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
