import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApi, type UserListItem, type SystemStats } from '../api/adminApi';
import type { PaginatedResponse } from '../types/project';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

const ROLES = ['Admin', 'ProjectManager', 'TeamMember'];

export default function Admin() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [modelInfo, setModelInfo] = useState<Record<string, unknown> | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { loadUsers(); }, [page]);

  const loadAll = async () => {
    setLoading(true);
    await Promise.allSettled([loadUsers(), loadStats(), loadModelInfo()]);
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const res = await adminApi.getStats();
      if (res.data.success && res.data.data) setStats(res.data.data);
    } catch { /* ignore */ }
  };

  const loadUsers = async () => {
    try {
      const res = await adminApi.getUsers(page, pageSize);
      if (res.data.success && res.data.data) {
        const data = res.data.data as PaginatedResponse<UserListItem>;
        setUsers(data.items);
        setTotalUsers(data.totalCount);
      }
    } catch { /* ignore */ }
  };

  const loadModelInfo = async () => {
    try {
      const res = await adminApi.getModelInfo();
      if (res.data.success && res.data.data) setModelInfo(res.data.data as Record<string, unknown>);
    } catch { /* ignore */ }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    setActionLoading(userId);
    setMessage('');
    try {
      await adminApi.changeUserRole(userId, role);
      setMessage('Role updated successfully');
      await loadUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to change role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentActive: boolean) => {
    setActionLoading(userId);
    setMessage('');
    try {
      await adminApi.changeUserStatus(userId, !currentActive);
      setMessage(`User ${currentActive ? 'deactivated' : 'activated'} successfully`);
      await loadUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to change status');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  if (loading) return <Spinner className="py-24" size="lg" />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Admin Panel</h2>
      <p className="text-slate-500 text-sm mb-6">User management, system stats, and AI model info</p>

      {message && (
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-sm">{message}</div>
      )}

      {/* System Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Users', value: stats.totalUsers, color: 'text-indigo-700 bg-indigo-50' },
            { label: 'Projects', value: stats.totalProjects, color: 'text-emerald-700 bg-emerald-50' },
            { label: 'Tasks', value: stats.totalTasks, color: 'text-blue-700 bg-blue-50' },
            { label: 'Predictions', value: stats.totalPredictions, color: 'text-amber-700 bg-amber-50' },
            { label: 'High Risk', value: stats.highRiskProjects, color: 'text-red-700 bg-red-50' },
            { label: 'Alerts', value: stats.activeAlerts, color: 'text-purple-700 bg-purple-50' },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold rounded-lg inline-block px-2 ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* User Management Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">User Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 font-medium text-slate-600">Name</th>
                <th className="text-left py-3 px-2 font-medium text-slate-600">Email</th>
                <th className="text-center py-3 px-2 font-medium text-slate-600">Role</th>
                <th className="text-center py-3 px-2 font-medium text-slate-600">Status</th>
                <th className="text-center py-3 px-2 font-medium text-slate-600">Joined</th>
                <th className="text-center py-3 px-2 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-2 font-medium text-slate-900">{u.fullName}</td>
                  <td className="py-3 px-2 text-slate-600">{u.email}</td>
                  <td className="py-3 px-2 text-center">
                    <select
                      className="px-2 py-1 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-indigo-500"
                      value={u.roles[0] || ''}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={actionLoading === u.id}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Badge variant={u.isActive ? 'success' : 'danger'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-center text-slate-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Button
                      variant={u.isActive ? 'danger' : 'primary'}
                      size="sm"
                      loading={actionLoading === u.id}
                      onClick={() => handleStatusToggle(u.id, u.isActive)}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalUsers)} of {totalUsers}
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
      </motion.div>

      {/* AI Model Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">AI Model Information</h3>
        {modelInfo ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(modelInfo).map(([key, value]) => (
              <div key={key} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-0.5">{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                <p className="text-sm font-medium text-slate-900">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm text-center py-6">
            Model info not available. Make sure the AI service is running.
          </p>
        )}
      </motion.div>
    </div>
  );
}
