import { useEffect, useState } from 'react';
import API from '../api/axios';
import { FiCheckSquare, FiTarget, FiBook, FiFileText, FiClock, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon: Icon, label, value, subtitle, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}>
        <Icon className="text-xl text-white" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      API.get('/api/dashboard'),
      API.get('/api/streak'),
    ])
      .then(([dashRes, streakRes]) => {
        setData(dashRes.data);
        setStreak(streakRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Good day, {user?.username}!
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your study overview</p>
      </div>

      {/* Streak Banner */}
      {streak && (
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">Current Streak</p>
            <p className="text-4xl font-bold mt-1">{streak.currentStreak} <span className="text-2xl">days</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Longest Streak</p>
            <p className="text-2xl font-bold">{streak.longestStreak} days</p>
          </div>
          <div className="text-6xl opacity-30">🔥</div>
        </div>
      )}

      {/* Stats Grid */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FiCheckSquare}
            label="Tasks"
            value={`${data.completedTasks}/${data.totalTasks}`}
            subtitle={`${data.taskProgress}% completed`}
            color="bg-blue-500"
          />
          <StatCard
            icon={FiTarget}
            label="Goals"
            value={`${data.completedGoals}/${data.totalGoals}`}
            subtitle={`${data.goalProgress}% completed`}
            color="bg-green-500"
          />
          <StatCard
            icon={FiBook}
            label="Subjects"
            value={data.totalSubjects}
            color="bg-purple-500"
          />
          <StatCard
            icon={FiFileText}
            label="Notes"
            value={data.totalNotes}
            color="bg-yellow-500"
          />
        </div>
      )}

      {/* Progress Bars */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiCheckSquare className="text-blue-500" />
                <span className="font-medium text-gray-800">Task Progress</span>
              </div>
              <span className="text-sm font-semibold text-blue-600">{data.taskProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${data.taskProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{data.completedTasks} of {data.totalTasks} tasks done</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FiTarget className="text-green-500" />
                <span className="font-medium text-gray-800">Goal Progress</span>
              </div>
              <span className="text-sm font-semibold text-green-600">{data.goalProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${data.goalProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{data.completedGoals} of {data.totalGoals} goals done</p>
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      {data?.todaysClasses?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FiCalendar className="text-indigo-500 text-lg" />
            <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h2>
          </div>
          <div className="space-y-3">
            {data.todaysClasses.map((cls) => (
              <div key={cls.id} className="flex items-center gap-4 p-3 bg-indigo-50 rounded-xl">
                <div className="flex items-center gap-1 text-indigo-600">
                  <FiClock className="text-sm" />
                  <span className="text-sm font-medium">
                    {cls.startTime} – {cls.endTime}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{cls.subjectName || 'Class'}</p>
                  {cls.description && <p className="text-xs text-gray-500">{cls.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
