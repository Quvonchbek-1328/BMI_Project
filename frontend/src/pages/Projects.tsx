import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projectsApi } from '../api/projectsApi';
import type { Project } from '../types/project';
import { PROJECT_STATUSES } from '../types/task';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge, { getStatusBadgeVariant, getRiskBadgeVariant } from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const fetchProjects = async (p = page) => {
    setLoading(true);
    try {
      const res = await projectsApi.getAll(p, 10);
      if (res.data.success && res.data.data) {
        setProjects(res.data.data.items);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectsApi.delete(id);
      fetchProjects();
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
          <p className="text-slate-500 text-sm mt-1">Manage your projects and track risk levels</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Project</Button>
      </div>

      {loading ? (
        <Spinner className="py-20" />
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-lg">No projects yet. Create your first project to get started.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-lg font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      {project.name}
                    </Link>
                    {project.description && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge>
                      {project.latestRiskLevel && (
                        <Badge variant={getRiskBadgeVariant(project.latestRiskLevel)}>
                          Risk: {project.latestRiskLevel}
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400">
                        {project.completedTaskCount}/{project.taskCount} tasks done
                      </span>
                      {project.latestDelayProbability !== null && project.latestDelayProbability !== undefined && (
                        <span className="text-xs text-slate-400">
                          Delay: {(project.latestDelayProbability * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => setEditProject(project)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(project.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <ProjectFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { setShowCreate(false); fetchProjects(); }}
      />

      {/* Edit Modal */}
      {editProject && (
        <ProjectFormModal
          open={!!editProject}
          onClose={() => setEditProject(null)}
          onSuccess={() => { setEditProject(null); fetchProjects(); }}
          project={editProject}
        />
      )}
    </div>
  );
}

// ─── Project Form Modal ───
interface FormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project?: Project;
}

function ProjectFormModal({ open, onClose, onSuccess, project }: FormProps) {
  const isEdit = !!project;
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [status, setStatus] = useState(project?.status || 'NotStarted');
  const [startDate, setStartDate] = useState(project?.startDate?.split('T')[0] || '');
  const [endDate, setEndDate] = useState(project?.endDate?.split('T')[0] || '');
  const [budget, setBudget] = useState(project?.budget?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setStatus(project.status);
      setStartDate(project.startDate?.split('T')[0] || '');
      setEndDate(project.endDate?.split('T')[0] || '');
      setBudget(project.budget?.toString() || '');
    } else {
      setName(''); setDescription(''); setStatus('NotStarted');
      setStartDate(''); setEndDate(''); setBudget('');
    }
  }, [project, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await projectsApi.update(project!.id, {
          name, description: description || undefined, status,
          startDate, endDate: endDate || undefined,
          budget: budget ? parseFloat(budget) : undefined,
        });
      } else {
        await projectsApi.create({
          name, description: description || undefined,
          startDate, endDate: endDate || undefined,
          budget: budget ? parseFloat(budget) : undefined,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Project' : 'Create Project'}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Project Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={status} onChange={(e) => setStatus(e.target.value)}
            >
              {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <Input label="Budget" type="number" step="0.01" placeholder="0.00" value={budget} onChange={(e) => setBudget(e.target.value)} />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{isEdit ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}
