import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiSave, FiEdit2 } from 'react-icons/fi';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: '', bio: '', image: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    API.get('/api/user/profile')
      .then(res => {
        setProfile(res.data);
        setForm({ fullName: res.data.fullName || '', bio: res.data.bio || '', image: res.data.image || '' });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put('/api/user/profile', form);
      setProfile(res.data);
      setEditing(false);
      setSuccess('Profile updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'SP';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account information</p>
      </div>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm">{success}</div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 pb-12" />
        <div className="px-6 pb-6 -mt-8">
          <div className="flex items-end justify-between mb-4">
            <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
              {profile?.image
                ? <img src={profile.image} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-indigo-600">{initials}</span>}
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-medium"
            >
              <FiEdit2 /> Edit Profile
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.fullName} placeholder="Your full name"
                  onChange={e => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3} value={form.bio} placeholder="Tell us about yourself"
                  onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                <input className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.image} placeholder="https://..."
                  onChange={e => setForm({ ...form, image: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditing(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                  <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{profile?.fullName || user?.username}</h2>
                {profile?.bio && <p className="text-gray-500 text-sm mt-1">{profile.bio}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiUser className="text-indigo-400" />
                  <span>@{user?.username}</span>
                </div>
                {profile?.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiMail className="text-indigo-400" />
                    <span>{profile.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
