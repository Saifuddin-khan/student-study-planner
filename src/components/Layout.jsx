import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiCheckSquare, FiTarget, FiBook, FiFileText,
  FiCalendar, FiClock, FiBell, FiBarChart2, FiMessageSquare,
  FiUser, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/tasks', label: 'Tasks', icon: FiCheckSquare },
  { path: '/goals', label: 'Goals', icon: FiTarget },
  { path: '/subjects', label: 'Subjects', icon: FiBook },
  { path: '/notes', label: 'Notes', icon: FiFileText },
  { path: '/timetable', label: 'Timetable', icon: FiCalendar },
  { path: '/pomodoro', label: 'Pomodoro', icon: FiClock },
  { path: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { path: '/ai-chat', label: 'AI Chat', icon: FiMessageSquare },
  { path: '/notifications', label: 'Notifications', icon: FiBell },
  { path: '/profile', label: 'Profile', icon: FiUser },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <FiBook className="text-white text-lg" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">StudyPlanner</h2>
            <p className="text-xs text-gray-500">{user?.username}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="text-lg shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <FiLogOut className="text-lg" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-white shadow-xl z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700"
            >
              <FiX className="text-xl" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar (mobile) */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <FiMenu className="text-xl" />
          </button>
          <span className="font-semibold text-gray-900">StudyPlanner</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
