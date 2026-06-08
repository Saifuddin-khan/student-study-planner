import { useEffect, useRef, useState } from 'react';
import API from '../api/axios';
import { FiPlay, FiPause, FiRotateCcw, FiClock } from 'react-icons/fi';

const MODES = [
  { key: 'FOCUS', label: 'Focus', minutes: 25, color: 'bg-red-500' },
  { key: 'SHORT_BREAK', label: 'Short Break', minutes: 5, color: 'bg-green-500' },
  { key: 'LONG_BREAK', label: 'Long Break', minutes: 15, color: 'bg-blue-500' },
];

export default function Pomodoro() {
  const [mode, setMode] = useState(MODES[0]);
  const [timeLeft, setTimeLeft] = useState(MODES[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const intervalRef = useRef(null);

  const fetchSessions = async () => {
    try {
      const res = await API.get('/api/pomodoro');
      setSessions(res.data.slice(0, 5));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchSessions(); }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleSessionComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleSessionComplete = async () => {
    if (!startTime) return;
    try {
      await API.post('/api/pomodoro', {
        sessionType: mode.key,
        durationMinutes: mode.minutes,
        startTime: startTime,
        endTime: new Date().toISOString().slice(0, 19),
      });
      fetchSessions();
    } catch (e) { console.error(e); }
  };

  const handleStart = () => {
    setStartTime(new Date().toISOString().slice(0, 19));
    setRunning(true);
  };

  const handlePause = () => setRunning(false);

  const handleReset = () => {
    setRunning(false);
    setTimeLeft(mode.minutes * 60);
    setStartTime(null);
  };

  const switchMode = (m) => {
    setRunning(false);
    setMode(m);
    setTimeLeft(m.minutes * 60);
    setStartTime(null);
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const progress = ((mode.minutes * 60 - timeLeft) / (mode.minutes * 60)) * 100;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pomodoro Timer</h1>
        <p className="text-gray-500 text-sm mt-1">Stay focused and productive</p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        {MODES.map(m => (
          <button key={m.key} onClick={() => switchMode(m)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${mode.key === m.key ? `${m.color} text-white shadow-sm` : 'text-gray-500 hover:bg-gray-50'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center gap-6">
        <div className="relative w-48 h-48">
          <svg className="w-48 h-48 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="8" />
            <circle cx="60" cy="60" r="54" fill="none"
              stroke={mode.key === 'FOCUS' ? '#ef4444' : mode.key === 'SHORT_BREAK' ? '#10b981' : '#3b82f6'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-gray-900 font-mono">{mins}:{secs}</span>
            <span className="text-sm text-gray-400 mt-1">{mode.label}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={handleReset}
            className="p-4 rounded-2xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
            <FiRotateCcw className="text-xl" />
          </button>
          <button
            onClick={running ? handlePause : handleStart}
            className={`px-10 py-4 rounded-2xl text-white font-semibold text-lg shadow-md transition flex items-center gap-2 ${
              mode.key === 'FOCUS' ? 'bg-red-500 hover:bg-red-600' :
              mode.key === 'SHORT_BREAK' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {running ? <FiPause /> : <FiPlay />}
            {running ? 'Pause' : 'Start'}
          </button>
        </div>
      </div>

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FiClock className="text-indigo-500" />
            <h2 className="font-semibold text-gray-900">Recent Sessions</h2>
          </div>
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.sessionType === 'FOCUS' ? 'bg-red-500' : s.sessionType === 'SHORT_BREAK' ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <span className="text-sm font-medium text-gray-700 capitalize">{s.sessionType.replace('_', ' ')}</span>
                </div>
                <span className="text-sm text-gray-400">{s.durationMinutes} min</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
