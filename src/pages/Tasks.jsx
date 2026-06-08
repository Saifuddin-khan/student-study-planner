import { useEffect, useState } from 'react';
import API from '../api/axios';
import { FiPlus, FiTrash2, FiCheckCircle, FiCircle, FiEdit2, FiX, FiCheck } from 'react-icons/fi';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', subjectId: '' });

  const fetch = async () => {
    try {
      const [taskRes, subjRes] = await Promise.all([
        API.get('/api/tasks'),
        API.get('/api/subjects'),
      ]);
      setTasks(taskRes.data);
      setSubjects(subjRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: '', description: '', dueDate: '', subjectId: subjects[0]?.id || '' });
    setShowForm(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
      subjectId: task.subjectId || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, subjectId: form.subjectId ? Number(form.subjectId) : null };
    try {
      if (editTask) {
        await API.put(`/api/tasks/${editTask.id}`, payload);
      } else {
        await API.post('/api/tasks', payload);
      }
      setShowForm(false);
      fetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving task');
    }
  };

  const toggleComplete = async (task) => {
    await API.put(`/api/tasks/${task.id}/status?completed=${!task.completed}`);
    fetch();
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    await API.delete(`/api/tasks/${id}`);
    fetch();
  };

  const pending = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">{pending.length} pending · {done.length} completed</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm text-sm font-medium"
        >
          <FiPlus /> New Task
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setShowForm(false)}><FiX className="text-gray-400 text-xl" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Task title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                  placeholder="Optional description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.subjectId}
                    onChange={e => setForm({ ...form, subjectId: e.target.value })}
                  >
                    <option value="">None</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm font-medium">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium">
                  {editTask ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center h-40 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-400 text-lg">No tasks yet</p>
              <p className="text-gray-300 text-sm mt-1">Click &quot;New Task&quot; to add one</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={`bg-white rounded-xl p-4 shadow-sm border flex items-start gap-3 transition ${task.completed ? 'border-gray-100 opacity-70' : 'border-gray-100'}`}>
                <button onClick={() => toggleComplete(task)} className="mt-0.5 shrink-0">
                  {task.completed
                    ? <FiCheckCircle className="text-green-500 text-xl" />
                    : <FiCircle className="text-gray-300 text-xl hover:text-indigo-400 transition" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-gray-900 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                  </p>
                  {task.description && <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {task.subjectName && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                        {task.subjectName}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs font-medium">
                        Due: {task.dueDate}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(task)} className="p-2 text-gray-400 hover:text-indigo-500 transition">
                    <FiEdit2 />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="p-2 text-gray-400 hover:text-red-500 transition">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
