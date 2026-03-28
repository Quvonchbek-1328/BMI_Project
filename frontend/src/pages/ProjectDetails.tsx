import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsApi } from '../api/projectsApi';
import type { Project, ProjectSummary } from '../types/project';
import Badge, { getStatusBadgeVariant, getRiskBadgeVariant } from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [projRes, sumRes] = await Promise.all([
          projectsApi.getById(id),
          projectsApi.getSummary(id),
        ]);
        if (projRes.data.success) setProject(projRes.data.data!);
        if (sumRes.data.success) setSummary(sumRes.data.data!);
      } catch (err) {
        console.error('Failed to load project', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Spinner className="py-20" />;
  if (!project) return <p className="text-center text-slate-500 py-20">Project not found</p>;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link to="/projects" className="hover:text-indigo-600">Projects</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{project.name}</h2>
          {project.description && <p className="text-slate-500 mt-1">{project.description}</p>}
          <div className="flex items-center gap-3 mt-3">
            <Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge>
            {project.latestRiskLevel && (
              <Badge variant={getRiskBadgeVariant(project.latestRiskLevel)}>Risk: {project.latestRiskLevel}</Badge>
            )}
            <span className="text-xs text-slate-400">Owner: {project.ownerName}</span>
          </div>
        </div>
        <Link to={`/projects/${id}/tasks`}>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Manage Tasks
          </button>
        </Link>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard label="Total Tasks" value={summary.totalTasks} color="text-slate-700" />
          <SummaryCard label="Completed" value={summary.completedTasks} color="text-emerald-700" />
          <SummaryCard label="High Risk Tasks" value={summary.highRiskTasks} color="text-red-700" />
          <SummaryCard
            label="Progress"
            value={`${summary.progressPercent.toFixed(0)}%`}
            color="text-indigo-700"
          />
        </div>
      )}

      {/* Info Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <Info label="Start Date" value={new Date(project.startDate).toLocaleDateString()} />
          <Info label="End Date" value={project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'} />
          <Info label="Budget" value={project.budget ? `$${project.budget.toLocaleString()}` : '—'} />
          <Info
            label="Avg Delay Probability"
            value={summary?.averageDelayProbability != null
              ? `${(summary.averageDelayProbability * 100).toFixed(0)}%`
              : '—'}
          />
          <Info label="Overall Risk" value={summary?.overallRiskLevel || '—'} />
          <Info label="Unread Alerts" value={summary?.alertCount?.toString() || '0'} />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-slate-400">{label}:</span>{' '}
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
