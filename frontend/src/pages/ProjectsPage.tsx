import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  assigned_amount: string;
  objectives_count: number;
  progress_total: string;
  progress_current: string;
}

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    apiFetch<{ projects: Project[] }>('/projects')
      .then((data) => setProjects(data.projects))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify({ name, description: description || undefined }),
      });
      setName(''); setDescription('');
      setShowCreate(false);
      loadData();
    } catch {} finally { setSubmitting(false); }
  };

  const statusIcons: Record<string, string> = {
    active: '🚀',
    completed: '🎯',
    purchased: '🏆',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-sm">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-lg mx-auto px-4 py-2 space-y-4">
        {projects.length > 0 ? (
          <section className="space-y-3">
            {projects.map((p) => {
              const total = parseFloat(p.progress_total);
              const current = parseFloat(p.progress_current);
              const progress = total > 0 ? Math.min((current / total) * 100, 100) : 0;
              return (
                <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {statusIcons[p.status] || '🚀'} {p.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {p.objectives_count} objetivo{p.objectives_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {total > 0 && (
                    <>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            p.status === 'completed' ? 'bg-green-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 text-right">{Math.round(progress)}%</p>
                    </>
                  )}
                  {p.description && (
                    <p className="text-xs text-gray-400 mt-2">{p.description}</p>
                  )}
                </div>
              );
            })}
          </section>
        ) : (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <EmptyState
              message="¿Algo grande en mente? Crea un proyecto y empieza a construirlo."
              actionLabel="+ Nuevo proyecto"
              onAction={() => setShowCreate(true)}
            />
          </section>
        )}

        <button
          onClick={() => setShowCreate(true)}
          className="w-full py-3 bg-white rounded-2xl shadow-sm text-primary-600 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          + Nuevo proyecto
        </button>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo proyecto">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="proj-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input id="proj-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: Primera casa" />
          </div>
          <div>
            <label htmlFor="proj-desc" className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <input id="proj-desc" type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Una descripción corta..." />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </>
  );
}

export default ProjectsPage;
