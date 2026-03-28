import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { alertsApi } from '../../api/alertsApi';
import Button from '../ui/Button';

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const loadUnread = async () => {
    try {
      const res = await alertsApi.getUnreadCount();
      if (res.data.success && res.data.data != null) setUnreadCount(res.data.data);
    } catch { /* ignore */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div />
      <div className="flex items-center gap-4">
        {/* Alert bell */}
        <Link to="/alerts" className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <span className="text-sm text-slate-600">
          {user?.fullName}
          <span className="ml-2 text-xs text-slate-400">({user?.roles?.join(', ')})</span>
        </span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
