import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { alertsApi } from '../api/alertsApi';
import type { Alert } from '../types/alert';
import type { PaginatedResponse } from '../types/project';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

function getSeverityVariant(severity: string) {
  switch (severity) {
    case 'Critical': return 'danger' as const;
    case 'High': return 'warning' as const;
    case 'Medium': return 'info' as const;
    default: return 'default' as const;
  }
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => { loadAlerts(); }, [page]);
  useEffect(() => { loadUnreadCount(); }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertsApi.getAll(page, pageSize);
      if (res.data.success && res.data.data) {
        const data = res.data.data as PaginatedResponse<Alert>;
        setAlerts(data.items);
        setTotalCount(data.totalCount);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const loadUnreadCount = async () => {
    try {
      const res = await alertsApi.getUnreadCount();
      if (res.data.success && res.data.data != null) setUnreadCount(res.data.data);
    } catch { /* ignore */ }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await alertsApi.markAsRead(id);
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, isRead: true } : a));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await alertsApi.markAllAsRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
    setMarkingAll(false);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Alerts</h2>
          <p className="text-slate-500 text-sm">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" loading={markingAll} onClick={handleMarkAllRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {loading ? (
        <Spinner className="py-24" size="lg" />
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-slate-400 text-lg">No alerts yet</p>
          <p className="text-slate-400 text-sm mt-1">Alerts are generated when high-risk predictions are detected</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-colors ${
                alert.isRead ? 'border-slate-200' : 'border-indigo-200 bg-indigo-50/30'
              }`}
            >
              {/* Severity dot */}
              <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${
                alert.severity === 'Critical' ? 'bg-red-500' :
                alert.severity === 'High' ? 'bg-orange-500' :
                alert.severity === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
              }`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-semibold ${alert.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                    {alert.title}
                  </p>
                  <Badge variant={getSeverityVariant(alert.severity)}>{alert.severity}</Badge>
                  {!alert.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                </div>
                <p className="text-sm text-slate-600 mb-1">{alert.message}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{alert.projectName}</span>
                  {alert.taskTitle && <span>Task: {alert.taskTitle}</span>}
                  <span>{new Date(alert.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {!alert.isRead && (
                <Button variant="ghost" size="sm" onClick={() => handleMarkRead(alert.id)}>
                  Mark Read
                </Button>
              )}
            </motion.div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-slate-500">
                Page {page} of {totalPages} ({totalCount} total)
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
