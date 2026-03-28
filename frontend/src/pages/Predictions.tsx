import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { projectsApi } from '../api/projectsApi';
import { riskMetricsApi } from '../api/riskMetricsApi';
import { predictionsApi } from '../api/predictionsApi';
import type { Project } from '../types/project';
import type { CreateRiskMetricRequest } from '../types/riskMetric';
import { RISK_METRIC_FIELDS as FIELDS } from '../types/riskMetric';
import type { Prediction } from '../types/prediction';
import Button from '../components/ui/Button';
import Badge, { getRiskBadgeVariant } from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

export default function Predictions() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [latestPredictions, setLatestPredictions] = useState<Prediction[]>([]);
  const [result, setResult] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Metric form state
  const [metrics, setMetrics] = useState<CreateRiskMetricRequest>({
    taskComplexity: 5, teamWorkload: 5, requirementChanges: 3,
    bugCount: 5, dependencyCount: 3, resourceAvailability: 0.7,
    estimatedDuration: 30, actualDuration: undefined, sprintVelocity: 20,
    communicationDelay: 3, previousDelayCount: 1, teamExperienceLevel: 6,
    priorityLevel: 2,
  });

  useEffect(() => {
    loadProjects();
    loadLatest();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectsApi.getAll(1, 100);
      if (res.data.success && res.data.data) setProjects(res.data.data.items);
    } catch { /* ignore */ }
  };

  const loadLatest = async () => {
    setLoading(true);
    try {
      const res = await predictionsApi.getLatest();
      if (res.data.success && res.data.data) setLatestPredictions(res.data.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleMetricChange = (key: string, value: string) => {
    setMetrics((prev) => ({ ...prev, [key]: value === '' ? undefined : parseFloat(value) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) { setError('Please select a project'); return; }
    setError('');
    setResult(null);
    setSubmitting(true);

    try {
      // 1. Create risk metric
      const metricRes = await riskMetricsApi.create(selectedProjectId, metrics);
      if (!metricRes.data.success || !metricRes.data.data) {
        setError('Failed to save risk metrics');
        return;
      }
      const metricId = metricRes.data.data.id;

      // 2. Run prediction
      const predRes = await predictionsApi.run({ riskMetricId: metricId });
      if (predRes.data.success && predRes.data.data) {
        setResult(predRes.data.data);
        loadLatest();
      } else {
        setError(predRes.data.message || 'Prediction failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Prediction request failed. Make sure AI service is running.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Risk Prediction</h2>
      <p className="text-slate-500 text-sm mb-6">Input project metrics to predict schedule delay probability</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Input Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk Metrics Input</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                required
              >
                <option value="">Select a project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{field.label}</label>
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={metrics[field.key] ?? ''}
                    onChange={(e) => handleMetricChange(field.key, e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    title={field.hint}
                  />
                </div>
              ))}
            </div>

            <Button type="submit" loading={submitting} className="w-full mt-4">
              Run Prediction
            </Button>
          </form>
        </div>

        {/* Right: Result */}
        <div className="space-y-6">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Prediction Result</h3>

              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${
                    result.riskLevel === 'High' ? 'text-red-600' :
                    result.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {(result.delayProbability * 100).toFixed(0)}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Delay Probability</p>
                </div>
                <Badge variant={getRiskBadgeVariant(result.riskLevel)} className="text-base px-4 py-1">
                  {result.riskLevel} Risk
                </Badge>
              </div>

              {result.topFactors.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Top Risk Factors</h4>
                  <ul className="space-y-1">
                    {result.topFactors.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-medium">
                          {i + 1}
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {result.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-indigo-500 mt-0.5">&#8226;</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* Recent predictions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Predictions</h3>
            {loading ? (
              <Spinner className="py-8" />
            ) : latestPredictions.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No predictions yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {latestPredictions.map((pred) => (
                  <div key={pred.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{pred.projectName}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(pred.createdAt).toLocaleString()}
                        {pred.taskTitle && ` — ${pred.taskTitle}`}
                      </p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
