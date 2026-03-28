import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { projectsApi } from '../api/projectsApi';
import { predictionsApi } from '../api/predictionsApi';
import type { Project } from '../types/project';
import type { Prediction } from '../types/prediction';
import Badge, { getRiskBadgeVariant } from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

const RISK_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

export default function RiskAnalytics() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectPredictions, setProjectPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) loadProjectPredictions(selectedProjectId);
    else setProjectPredictions([]);
  }, [selectedProjectId]);

  const loadData = async () => {
    setLoading(true);
    const [projRes, predRes] = await Promise.allSettled([
      projectsApi.getAll(1, 100),
      predictionsApi.getLatest(),
    ]);
    if (projRes.status === 'fulfilled' && projRes.value.data.success)
      setProjects(projRes.value.data.data?.items || []);
    if (predRes.status === 'fulfilled' && predRes.value.data.success)
      setPredictions(predRes.value.data.data || []);
    setLoading(false);
  };

  const loadProjectPredictions = async (projectId: string) => {
    try {
      const res = await predictionsApi.getByProject(projectId);
      if (res.data.success && res.data.data) setProjectPredictions(res.data.data);
    } catch { setProjectPredictions([]); }
  };

  // Risk distribution data
  const riskDist = predictions.reduce(
    (acc, p) => {
      acc[p.riskLevel] = (acc[p.riskLevel] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const pieData = Object.entries(riskDist).map(([name, value]) => ({ name, value }));

  // Prediction trend (by date)
  const trendMap = new Map<string, { date: string; avg: number; count: number; total: number }>();
  [...predictions].reverse().forEach((p) => {
    const date = new Date(p.createdAt).toLocaleDateString();
    const existing = trendMap.get(date);
    if (existing) {
      existing.total += p.delayProbability;
      existing.count += 1;
      existing.avg = Math.round((existing.total / existing.count) * 100);
    } else {
      trendMap.set(date, { date, avg: Math.round(p.delayProbability * 100), count: 1, total: p.delayProbability });
    }
  });
  const trendData = Array.from(trendMap.values());

  // Project comparison bar chart
  const projectComparison = projects
    .filter((p) => p.latestDelayProbability != null)
    .sort((a, b) => (b.latestDelayProbability || 0) - (a.latestDelayProbability || 0))
    .slice(0, 10)
    .map((p) => ({
      name: p.name.length > 16 ? p.name.slice(0, 14) + '...' : p.name,
      probability: Math.round((p.latestDelayProbability || 0) * 100),
      riskLevel: p.latestRiskLevel || 'Low',
    }));

  // Per-project trend line
  const projectTrend = [...projectPredictions]
    .reverse()
    .map((p, i) => ({
      index: i + 1,
      probability: Math.round(p.delayProbability * 100),
      date: new Date(p.createdAt).toLocaleDateString(),
    }));

  // Top risk factors across all predictions
  const factorCount = new Map<string, number>();
  predictions.forEach((p) => {
    p.topFactors.forEach((f) => {
      factorCount.set(f, (factorCount.get(f) || 0) + 1);
    });
  });
  const topFactors = Array.from(factorCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name: name.length > 22 ? name.slice(0, 20) + '...' : name, count }));

  if (loading) return <Spinner className="py-24" size="lg" />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Risk Analytics</h2>
      <p className="text-slate-500 text-sm mb-6">Visual analysis of project risks and prediction trends</p>

      {predictions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-lg">No prediction data yet.</p>
          <p className="text-slate-400 text-sm mt-2">Run predictions from the Predictions page to see analytics here.</p>
        </div>
      ) : (
        <>
          {/* Row 1: Risk Distribution + Prediction Trend */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk Level Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Average Delay Probability Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(val) => `${val}%`} />
                  <Area type="monotone" dataKey="avg" stroke="#6366f1" fill="#eef2ff" strokeWidth={2} name="Avg Probability" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Row 2: Project Comparison + Top Risk Factors */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Risk Comparison</h3>
              {projectComparison.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-12">No project predictions yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={projectComparison} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val) => `${val}%`} />
                    <Bar dataKey="probability" radius={[0, 4, 4, 0]} name="Delay %">
                      {projectComparison.map((entry, i) => (
                        <Cell key={i} fill={RISK_COLORS[entry.riskLevel as keyof typeof RISK_COLORS] || '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Most Common Risk Factors</h3>
              {topFactors.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-12">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topFactors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, angle: -30 }} height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Occurrences" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

          {/* Row 3: Per-Project Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Project Risk Trend</h3>
              <select
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="">Select a project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {!selectedProjectId ? (
              <p className="text-slate-400 text-sm text-center py-12">Select a project to view its risk trend over time</p>
            ) : projectTrend.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-12">No predictions for this project yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={projectTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(val) => `${val}%`} />
                  <Line type="monotone" dataKey="probability" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Delay %" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Summary Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white rounded-xl border border-slate-200 p-6 mt-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">All Project Risk Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Project</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-600">Status</th>
                    <th className="text-center py-3 px-2 font-medium text-slate-600">Tasks</th>
                    <th className="text-center py-3 px-2 font-medium text-slate-600">Delay Prob.</th>
                    <th className="text-center py-3 px-2 font-medium text-slate-600">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2 font-medium text-slate-900">{p.name}</td>
                      <td className="py-3 px-2"><Badge variant={p.status === 'Completed' ? 'success' : p.status === 'InProgress' ? 'info' : 'default'}>{p.status}</Badge></td>
                      <td className="py-3 px-2 text-center text-slate-600">{p.completedTaskCount}/{p.taskCount}</td>
                      <td className="py-3 px-2 text-center font-semibold text-slate-700">
                        {p.latestDelayProbability != null ? `${(p.latestDelayProbability * 100).toFixed(0)}%` : '—'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {p.latestRiskLevel ? <Badge variant={getRiskBadgeVariant(p.latestRiskLevel)}>{p.latestRiskLevel}</Badge> : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
