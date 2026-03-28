import { useState, useEffect, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tasksApi } from '../api/tasksApi';
import type { Task, CreateTaskRequest } from '../types/task';
import { TASK_STATUSES, TASK_PRIORITIES } from '../types/task';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge, { getPriorityBadgeVariant, getRiskBadgeVariant } from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

export default function Tasks() {
  const { id: projectId } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTasks = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await tasksApi.getByProject(projectId, page, 20);
      if (res.data.success && res.data.data) {
        setTasks(res.data.data.items);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [projectId, page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksApi.delete(id);
      fetchTasks();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await tasksApi.updateStatus(taskId, newStatus);
      fetchTasks();
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link to="/projects" className="hover:text-indigo-600">Projects</Link>
        <span>/</span>
        <Link to={`/projects/${projectId}`} className="hover:text-indigo-600">Details</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Tasks</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tasks</h2>
          <p className="text-slate-500 text-sm mt-1">Manage tasks for this project</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ New Task</Button>
      </div>

      {loading ? (
        <Spinner className="py-20" />
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400">No tasks yet. Create your first task.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Priority</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Assignee</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Risk</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">Deadline</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task, i) => (
                  <motion.tr
                    key={task.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{task.title}</td>
                    <td className="px-4 py-3">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500"
                      >
                        {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{task.assigneeName || '—'}</td>
                    <td className="px-4 py-3">
                      {task.latestRiskLevel ? (
                        <Badge variant={getRiskBadgeVariant(task.latestRiskLevel)}>{task.latestRiskLevel}</Badge>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditTask(task)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}

      {/* Create Modal */}
      <TaskFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => { setShowCreate(false); fetchTasks(); }}
        projectId={projectId!}
      />

      {/* Edit Modal */}
      {editTask && (
        <TaskFormModal
          open={!!editTask}
          onClose={() => setEditTask(null)}
          onSuccess={() => { setEditTask(null); fetchTasks(); }}
          projectId={projectId!}
          task={editTask}
        />
      )}
    </div>
  );
}

// ─── Task Form Modal ───
interface FormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  task?: Task;
}

function TaskFormModal({ open, onClose, onSuccess, projectId, task }: FormProps) {
  const isEdit = !!task;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [actualHours, setActualHours] = useState('');
  const [deadline, setDeadline] = useState('');
  const [complexity, setComplexity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title); setDescription(task.description || '');
      setPriority(task.priority); setStatus(task.status);
      setEstimatedHours(task.estimatedHours?.toString() || '');
      setActualHours(task.actualHours?.toString() || '');
      setDeadline(task.deadline?.split('T')[0] || '');
      setComplexity(task.complexity?.toString() || '');
    } else {
      setTitle(''); setDescription(''); setPriority('Medium'); setStatus('Todo');
      setEstimatedHours(''); setActualHours(''); setDeadline(''); setComplexity('');
    }
  }, [task, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await tasksApi.update(task!.id, {
          title, description: description || undefined,
          status, priority,
          estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
          actualHours: actualHours ? parseFloat(actualHours) : undefined,
          deadline: deadline || undefined,
          complexity: complexity ? parseInt(complexity) : undefined,
        });
      } else {
        const req: CreateTaskRequest = {
          title, description: description || undefined,
          priority,
          estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
          deadline: deadline || undefined,
          complexity: complexity ? parseInt(complexity) : undefined,
        };
        await tasksApi.create(projectId, req);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Task' : 'Create Task'}>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={priority} onChange={(e) => setPriority(e.target.value)}>
              {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={status} onChange={(e) => setStatus(e.target.value)}>
                {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Estimated Hours" type="number" step="0.5" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} />
          {isEdit && <Input label="Actual Hours" type="number" step="0.5" value={actualHours} onChange={(e) => setActualHours(e.target.value)} />}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <Input label="Complexity (1-10)" type="number" min="1" max="10" value={complexity} onChange={(e) => setComplexity(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{isEdit ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}
