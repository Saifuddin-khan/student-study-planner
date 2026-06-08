import { useEffect, useState } from 'react';
import API from '../api/axios';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiFileText, FiSearch } from 'react-icons/fi';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', content: '', subjectId: '' });

  const fetch = async () => {
    try {
      const [notesRes, subjRes] = await Promise.all([
        API.get('/api/notes'),
        API.get('/api/subjects'),
      ]);
      setNotes(notesRes.data);
      setSubjects(subjRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditNote(null);
    setForm({ title: '', content: '', subjectId: '' });
    setShowForm(true);
  };

  const openEdit = (n) => {
    setEditNote(n);
    setForm({ title: n.title, content: n.content || '', subjectId: n.subjectId || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, subjectId: form.subjectId ? Number(form.subjectId) : null };
    try {
      if (editNote) await API.put(`/api/notes/${editNote.id}`, payload);
      else await API.post('/api/notes', payload);
      setShowForm(false);
      fetch();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const deleteNote = async (id) => {
    if (!confirm('Delete this note?')) return;
    await API.delete(`/api/notes/${id}`);
    fetch();
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    (n.content || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-500 text-sm mt-1">{notes.length} notes</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
          <FiPlus /> New Note
        </button>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editNote ? 'Edit Note' : 'New Note'}</h2>
              <button onClick={() => setShowForm(false)}><FiX className="text-gray-400 text-xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Note title" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={6} placeholder="Write your notes here..."
                  value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}>
                  <option value="">None</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium">{editNote ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center h-40 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <FiFileText className="text-5xl text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-lg">{search ? 'No matching notes' : 'No notes yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(n => (
            <div key={n.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FiFileText className="text-yellow-500 shrink-0" />
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{n.title}</h3>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(n)} className="p-1 text-gray-400 hover:text-indigo-500 transition"><FiEdit2 className="text-sm" /></button>
                  <button onClick={() => deleteNote(n.id)} className="p-1 text-gray-400 hover:text-red-500 transition"><FiTrash2 className="text-sm" /></button>
                </div>
              </div>
              {n.content && <p className="text-sm text-gray-500 line-clamp-3">{n.content}</p>}
              <div className="mt-auto flex items-center justify-between">
                {n.subjectName && (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                    {n.subjectName}
                  </span>
                )}
                {n.updatedAt && (
                  <span className="text-xs text-gray-300 ml-auto">
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
