import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

interface Objective {
  id: number;
  name: string;
  target_amount: string;
  current_amount: string;
  status: string;
  project_id: number | null;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  assigned_amount: string;
  objectives_count: number;
  progress_total: string;
  progress_current: string;
  objectives: Objective[];
}

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<Project | null>(null);
  const [showAddObjective, setShowAddObjective] = useState<Project | null>(null);
  const [showCreateObjective, setShowCreateObjective] = useState<Project | null>(null);
  const [availableObjectives, setAvailableObjectives] = useState<Objective[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // New objective form
  const [objName, setObjName] = useState('');
  const [objAmount, setObjAmount] = useState('');
  const [objDescription, setObjDescription] = useState('');

  const loadData = () => {
    apiFetch<{ projects: Project[] }>('/projects')
      .then((data) => setProjects(data.projects))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadAvailableObjectives = () => {
    apiFetch<{ objectives: Objective[] }>('/projects/available-objectives')
      .then((data) => setAvailableObjectives(data.objectives))
      .catch(() => {});
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

  const handleLinkObjective = async (projectId: number, objectiveId: number) => {
    setSubmitting(true);
    try {
      await apiFetch(`/projects/${projectId}/link-objective`, {
        method: 'POST',
        body: JSON.stringify({ objective_id: objectiveId }),
      });
      setShowAddObjective(null);
      loadData();
    } catch {} finally { setSubmitting(false); }
  };

  const handleUnlinkObjective = async (projectId: number, objectiveId: number) => {
    try {
      await apiFetch(`/projects/${projectId}/unlink-objective/${objectiveId}`, {
        method: 'POST',
      });
      loadData();
      // Update detail view
      if (showDetail) {
        setShowDetail({
          ...showDetail,
          objectives: showDetail.objectives.filter((o) => o.id !== objectiveId),
        });
      }
    } catch {}
  };

  const handleCreateObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCreateObjective) return;
    setSubmitting(true);
    try {
      await apiFetch('/objectives', {
        method: 'POST',
        body: JSON.stringify({
          name: objName,
          target_amount: parseFloat(objAmount),
          description: objDescription || undefined,
          project_id: showCreateObjective.id,
        }),
      });
      setObjName(''); setObjAmount(''); setObjDescription('');
      setShowCreateObjective(null);
      loadData();
    } catch {} finally { setSubmitting(false); }
  };

  const handleDelete = async (project: Project) => {
    const confirmed = window.confirm(
      `¿Estas seguro de eliminar el proyecto "${project.name}"? Los objetivos se desvincularan pero no se eliminaran.`
    );
    if (!confirmed) return;
    try {
      await apiFetch(`/projects/${project.id}`, { method: 'DELETE' });
      loadData();
    } catch {}
  };

  const openAddObjective = (project: Project) => {
    loadAvailableObjectives();
    setShowAddObjective(project);
  };

  const openDetail = (project: Project) => {
    setShowDetail(project);
  };

  const fmt = (n: string | number) => {
    const num = typeof n === 'string' ? parseFloat(n) : n;
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
                    <button
                      onClick={() => openDetail(p)}
                      className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors text-left"
                    >
                      {statusIcons[p.status] || '🚀'} {p.name}
                    </button>
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
                      <p className="text-xs text-gray-400 text-right mb-2">{Math.round(progress)}%</p>
                    </>
                  )}
                  {p.description && (
                    <p className="text-xs text-gray-400 mb-3">{p.description}</p>
                  )}

                  {/* Action buttons */}
                  {p.status === 'active' && (
                    <div className="flex flex-wrap gap-2 items-center">
                      <button
                        onClick={() => openAddObjective(p)}
                        className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100 transition-colors"
                      >
                        + Agregar objetivo existente
                      </button>
                      <button
                        onClick={() => setShowCreateObjective(p)}
                        className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors"
                      >
                        + Crear nuevo objetivo
                      </button>
                      <button
                        onClick={() => openDetail(p)}
                        className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                      >
                        Ver objetivos
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="text-xs px-2 py-1.5 text-red-500 font-medium hover:text-red-700 transition-colors ml-auto"
                      >
                        Eliminar
                      </button>
                    </div>
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

      {/* Create Project Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo proyecto">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="proj-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input id="proj-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: Primera casa" />
          </div>
          <div>
            <label htmlFor="proj-desc" className="block text-sm font-medium text-gray-700 mb-1">Descripcion (opcional)</label>
            <input id="proj-desc" type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Una descripcion corta..." />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </Modal>

      {/* Project Detail Modal (view objectives) */}
      <Modal isOpen={showDetail !== null} onClose={() => setShowDetail(null)} title={showDetail ? `${showDetail.name} — Objetivos` : ''}>
        {showDetail && (
          <div className="space-y-3">
            {showDetail.objectives.length > 0 ? (
              showDetail.objectives.map((obj) => {
                const current = parseFloat(obj.current_amount);
                const target = parseFloat(obj.target_amount);
                const progress = Math.min((current / target) * 100, 100);
                return (
                  <div key={obj.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{obj.name}</span>
                      <button
                        onClick={() => handleUnlinkObjective(showDetail.id, obj.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                        title="Quitar del proyecto"
                      >
                        Quitar
                      </button>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                      <div
                        className={`h-1.5 rounded-full ${obj.status === 'completed' ? 'bg-green-500' : 'bg-primary-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">{fmt(obj.current_amount)} / {fmt(obj.target_amount)} Bs</p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No hay objetivos en este proyecto.</p>
            )}
            {showDetail.status === 'active' && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setShowDetail(null); openAddObjective(showDetail); }}
                  className="flex-1 py-2 px-3 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                >
                  + Agregar existente
                </button>
                <button
                  onClick={() => { setShowDetail(null); setShowCreateObjective(showDetail); }}
                  className="flex-1 py-2 px-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                >
                  + Crear nuevo
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Existing Objective Modal */}
      <Modal isOpen={showAddObjective !== null} onClose={() => setShowAddObjective(null)} title="Agregar objetivo al proyecto">
        {showAddObjective && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Proyecto: <span className="font-medium text-gray-700">{showAddObjective.name}</span>
            </p>
            {availableObjectives.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableObjectives.map((obj) => (
                  <div key={obj.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{obj.name}</p>
                      <p className="text-xs text-gray-400">{fmt(obj.target_amount)} Bs</p>
                    </div>
                    <button
                      onClick={() => handleLinkObjective(showAddObjective.id, obj.id)}
                      disabled={submitting}
                      className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                No hay objetivos disponibles. Todos ya estan asignados a un proyecto.
              </p>
            )}
            <button
              onClick={() => { setShowAddObjective(null); setShowCreateObjective(showAddObjective); }}
              className="w-full py-2 px-4 bg-green-50 text-green-700 rounded-lg font-medium text-sm hover:bg-green-100 transition-colors"
            >
              Crear un nuevo objetivo para este proyecto
            </button>
          </div>
        )}
      </Modal>

      {/* Create New Objective for Project Modal */}
      <Modal isOpen={showCreateObjective !== null} onClose={() => setShowCreateObjective(null)} title="Nuevo objetivo para proyecto">
        {showCreateObjective && (
          <form onSubmit={handleCreateObjective} className="space-y-4">
            <p className="text-sm text-gray-500">
              Proyecto: <span className="font-medium text-gray-700">{showCreateObjective.name}</span>
            </p>
            <div>
              <label htmlFor="new-obj-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del objetivo</label>
              <input id="new-obj-name" type="text" value={objName} onChange={(e) => setObjName(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ej: Audifonos" />
            </div>
            <div>
              <label htmlFor="new-obj-amount" className="block text-sm font-medium text-gray-700 mb-1">Monto objetivo</label>
              <input id="new-obj-amount" type="number" min="0.01" step="0.01" value={objAmount}
                onChange={(e) => setObjAmount(e.target.value)} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="800.00" />
            </div>
            <div>
              <label htmlFor="new-obj-desc" className="block text-sm font-medium text-gray-700 mb-1">Descripcion (opcional)</label>
              <input id="new-obj-desc" type="text" value={objDescription} onChange={(e) => setObjDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Una descripcion corta..." />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {submitting ? 'Creando...' : 'Crear objetivo'}
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}

export default ProjectsPage;
