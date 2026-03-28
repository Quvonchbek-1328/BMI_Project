import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { adminApi, type SystemStats } from '../api/adminApi';
import { predictionsApi } from '../api/predictionsApi';
import { alertsApi } from '../api/alertsApi';
import { projectsApi } from '../api/projectsApi';
import type { Prediction } from '../types/prediction';
import type { Alert } from '../types/alert';
import type { Project } from '../types/project';
import Badge, { getRiskBadgeVariant } from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

const COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981', None: '#94a3b8' };

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      adminApi.getStats(),
      predictionsApi.getLatest(),
      alertsApi.getAll(1, 5),
      projectsApi.getAll(1, 50),
    ]);

    if (results[0].status === 'fulfilled' && results[0].value.data.success)
      setStats(results[0].value.data.data!);
    if (results[1].status === 'fulfilled' && results[1].value.data.success)
      setPredictions(results[1].value.data.data || []);
    if (results[2].status === 'fulfilled' && results[2].value.data.success)
      setAlerts(results[2].value.data.data?.items || []);
    if (results[3].status === 'fulfilled' && results[3].value.data.success)
      setProjects(results[3].value.data.data?.items || []);

    setLoading(false);
  };

  // Risk distribution for pie chart
  const riskCounts = projects.reduce(
    (acc, p) => {
      const level = p.latestRiskLevel || 'None';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const pieData = Object.entries(riskCounts).map(([name, value]) => ({ name, value }));

  // Top risky projects for bar chart
  const riskyProjects = [...projects]
    .filter((p) => p.latestDelayProbability != null)
    .sort((a, b) => (b.latestDelayProbability || 0) - (a.latestDelayProbability || 0))
    .slice(0, 6)
    .map((p) => ({
      name: p.name.length > 14 ? p.name.slice(0, 12) + '...' : p.name,
      probability: Math.round((p.latestDelayProbability || 0) * 100),
    }));

  if (loading) return <Spinner className="py-24" size="lg" />;

  const statCards = [
    { label: 'Total Projects', value: stats?.totalProjects ?? 0, color: 'bg-indigo-50 text-indigo-700', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    { label: 'Active Tasks', value: stats?.totalTasks ?? 0, color: 'bg-emerald-50 text-emerald-700', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'High Risk', value: stats?.highRiskProjects ?? 0, color: 'bg-red-50 text-red-700', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
    { label: 'Predictions', value: stats?.totalPredictions ?? 0, color: 'bg-amber-50 text-amber-700', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500 mt-1">Welcome back, {user?.fullName}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500">{card.label}</p>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Risk Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk Distribution</h3>
          {pieData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-12">No project data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.None}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Top Risky Projects Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Risky Projects</h3>
          {riskyProjects.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-12">Run predictions to see data</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={riskyProjects} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => `${val}%`} />
                <Bar dataKey="probability" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Bottom Row: Recent Predictions + Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Predictions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Predictions</h3>
            <Link to="/predictions" className="text-sm text-indigo-600 hover:text-indigo-800">View all</Link>
          </div>
          {predictions.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No predictions yet</p>
          ) : (
            <div className="space-y-3">
              {predictions.slice(0, 5).map((pred) => (
                <div key={pred.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{pred.projectName}</p>
                    <p className="text-xs text-slate-400">{new Date(pred.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {(pred.delayProbability * 100).toFixed(0)}%
                    </span>
                    <Badge variant={getRiskBadgeVariant(pred.riskLevel)}>{pred.riskLevel}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Alerts</h3>
            <Link to="/alerts" className="text-sm text-indigo-600 hover:text-indigo-800">View all</Link>
          </div>
          {alerts.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No alerts</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`flex items-start gap-3 py-2 border-b border-slate-100 last:border-0 ${!alert.isRead ? 'bg-indigo-50/50 -mx-2 px-2 rounded-lg' : ''}`}>
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    alert.severity === 'Critical' ? 'bg-red-500' :
                    alert.severity === 'High' ? 'bg-orange-500' :
                    alert.severity === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{alert.title}</p>
                    <p className="text-xs text-slate-500 truncate">{alert.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(alert.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
