import { useEffect, useState } from 'react';
import API from '../api/axios';
import { FiBarChart2, FiClock, FiCheckSquare, FiTarget, FiZap } from 'react-icons/fi';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/api/analytics'),
      API.get('/api/ai/recommendations/readiness'),
    ])
      .then(([aRes, rRes]) => {
        setData(aRes.data);
        setReadiness(rRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Your study performance overview</p>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-xl"><FiClock className="text-blue-600 text-lg" /></div>
              <span className="text-sm font-medium text-gray-500">Study Hours</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.totalStudyHours}</p>
            <p className="text-xs text-gray-400 mt-1">Total hours focused</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-xl"><FiCheckSquare className="text-green-600 text-lg" /></div>
              <span className="text-sm font-medium text-gray-500">Tasks Done</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.completedTasks}</p>
            <p className="text-xs text-gray-400 mt-1">Completed tasks</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-xl"><FiTarget className="text-purple-600 text-lg" /></div>
              <span className="text-sm font-medium text-gray-500">Goals Met</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.completedGoals}</p>
            <p className="text-xs text-gray-400 mt-1">Goals achieved</p>
          </div>
        </div>
      )}

      {/* Subject Breakdown */}
      {data?.subjectBreakdown?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <FiBarChart2 className="text-indigo-500 text-lg" />
            <h2 className="font-semibold text-gray-900">Subject Breakdown</h2>
          </div>
          <div className="space-y-4">
            {data.subjectBreakdown.map((s, i) => {
              const max = Math.max(...data.subjectBreakdown.map(x => x.taskCount));
              const pct = max > 0 ? (s.taskCount / max) * 100 : 0;
              const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-800">{s.subjectName}</span>
                    <span className="text-sm text-gray-400">{s.taskCount} tasks</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${colors[i % colors.length]} transition-all`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exam Readiness */}
      {readiness && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <FiZap className="text-yellow-500 text-lg" />
            <h2 className="font-semibold text-gray-900">Exam Readiness</h2>
          </div>
          <div className="flex items-center gap-6 mb-5">
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle cx="40" cy="40" r="34" fill="none"
                  stroke={readiness.score > 75 ? '#10b981' : readiness.score > 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - readiness.score / 100)}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{readiness.score}%</span>
              </div>
            </div>
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${readiness.score > 75 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {readiness.status}
              </span>
              <p className="text-sm text-gray-500 mt-3 max-w-sm">{readiness.analysis?.slice(0, 200)}...</p>
            </div>
          </div>
          {readiness.recommendations?.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">AI Recommendations:</p>
              <ul className="space-y-1">
                {readiness.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
