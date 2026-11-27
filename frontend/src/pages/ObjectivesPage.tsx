import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

interface Objective {
  id: number;
  name: string;
  description: string | null;
  target_amount: string;
  current_amount: string;
  status: string;
  project_id: number | null;
}

interface MoneySource {
  id: number;
  name: string;
  type: string;
  balance: string;
}

interface Project {
  id: number;
  name: string;
  status: string;
}

function ObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState<Objective | null>(null);
  const [showUnassign, setShowUnassign] = useState<Objective | null>(null);
  const [showPurchase, setShowPurchase] = useState<Objective | null>(null);
  const [showLinkProject, setShowLinkProject] = useState<Objective | null>(null);

  // Sources for modals
  const [sources, setSources] = useState<MoneySource[]>([]);
  // Projects for linking
  const [projects, setProjects] = useState<Project[]>([]);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [description, setDescription] = useState('');
  const [assignAmount, setAssignAmount] = useState('');
  const [assignSourceId, setAssignSourceId] = useState('');
  const [unassignAmount, setUnassignAmount] = useState('');
  const [unassignSourceId, setUnassignSourceId] = useState('');
  const [purchaseSourceId, setPurchaseSourceId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = () => {
    apiFetch<{ objectives: Objective[] }>('/objectives')
      .then((data) => setObjectives(data.objectives))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadSources = () => {
    apiFetch<{ sources: MoneySource[] }>('/sources')
      .then((data) => setSources(data.sources))
      .catch(() => {});
  };

  const loadProjects = () => {
    apiFetch<{ projects: Project[] }>('/projects')
      .then((data) => setProjects(data.projects.filter((p) => p.status === 'active')))
      .catch(() => {});
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch('/objectives', {
        method: 'POST',
        body: JSON.stringify({
          name,
          target_amount: parseFloat(targetAmount),
          description: description || undefined,
        }),
      });
      setName(''); setTargetAmount(''); setDescription('');
      setShowCreate(false);
      loadData();
    } catch {} finally { setSubmitting(false); }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAssign || !assignSourceId) return;
    setSubmitting(true);
    try {
      await apiFetch(`/objectives/${showAssign.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(assignAmount),
          source_id: parseInt(assignSourceId),
        }),
      });
      setAssignAmount('');
      setAssignSourceId('');
      setShowAssign(null);
      loadData();
    } catch {} finally { setSubmitting(false); }
  };

  const handleUnassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showUnassign || !unassignSourceId) return;
    setSubmitting(true);
    try {
      await apiFetch(`/objectives/${showUnassign.id}/unassign`, {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(unassignAmount),
          source_id: parseInt(unassignSourceId),
        }),
      });
      setUnassignAmount('');
      setUnassignSourceId('');
      setShowUnassign(null);
      loadData();
    } catch {} finally { setSubmitting(false); }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPurchase || !purchaseSourceId) return;
    setSubmitting(true);
    try {
      await apiFetch(`/objectives/${showPurchase.id}/purchase`, {
        method: 'POST',
        body: JSON.stringify({ source_id: parseInt(purchaseSourceId) }),
      });
      setPurchaseSourceId('');
      setShowPurchase(null);
      loadData();
    } catch {} finally { setSubmitting(false); }
  };

  const handleDelete = async (obj: Objective) => {
    const confirmed = window.confirm(
      `¿Estas seguro de eliminar el objetivo "${obj.name}"? Esta accion no se puede deshacer.`
    );
    if (!confirmed) return;
    try {
      await apiFetch(`/objectives/${obj.id}`, { method: 'DELETE' });
      loadData();
    } catch {}
  };

  const handleLinkToProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showLinkProject || !selectedProjectId) return;
    setSubmitting(true);
    try {
      await apiFetch(`/projects/${selectedProjectId}/link-objective`, {
        method: 'POST',
        body: JSON.stringify({ objective_id: showLinkProject.id }),
      });
      setSelectedProjectId('');
      setShowLinkProject(null);
      loadData();
    } catch {} finally { setSubmitting(false); }
  };

  const handleUnlinkFromProject = async (obj: Objective) => {
    if (!obj.project_id) return;
    try {
      await apiFetch(`/projects/${obj.project_id}/unlink-objective/${obj.id}`, {
        method: 'POST',
      });
      loadData();
    } catch {}
  };

  const openAssignModal = (obj: Objective) => {
    loadSources();
    setShowAssign(obj);
  };

  const openUnassignModal = (obj: Objective) => {
    loadSources();
    setShowUnassign(obj);
  };

  const openPurchaseModal = (obj: Objective) => {
    loadSources();
    setShowPurchase(obj);
  };

  const openLinkProjectModal = (obj: Objective) => {
    loadProjects();
    setShowLinkProject(obj);
  };

  const fmt = (n: string | number) => {
    const num = typeof n === 'string' ? parseFloat(n) : n;
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const statusLabels: Record<string, { icon: string; label: string; color: string }> = {
    pending: { icon: '⬜', label: 'Pendiente', color: 'text-gray-500' },
    in_progress: { icon: '🔄', label: 'En progreso', color: 'text-blue-600' },
    completed: { icon: '✅', label: 'Completado', color: 'text-green-600' },
    purchased: { icon: '🛒', label: 'Comprado', color: 'text-purple-600' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 rounded-full border-2 border-primary-600 border-r-transparent animate-spin" role="status" aria-label="Cargando" />
      </div>
    );
  }

  const activeObjectives = objectives.filter((o) => o.status !== 'purchased' && o.status !== 'deleted');
  const historyObjectives = objectives.filter((o) => o.status === 'purchased' || o.status === 'deleted');

  return (
    <>
      <div className="max-w-lg mx-auto px-4 py-2 space-y-4">
        {activeObjectives.length > 0 ? (
          <section className="space-y-3">
            {activeObjectives.map((obj) => {
              const current = parseFloat(obj.current_amount);
              const target = parseFloat(obj.target_amount);
              const progress = Math.min((current / target) * 100, 100);
              const status = statusLabels[obj.status] || statusLabels.pending;

              return (
                <div
                  key={obj.id}
                  className="card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {status.icon} {obj.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 amount">
                      {fmt(obj.current_amount)} / {fmt(obj.target_amount)} Bs
                    </span>
                  </div>
                  <div className="progress mb-3">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        obj.status === 'completed' ? 'bg-green-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs font-medium ${status.color}`}>{status.label}</p>
                    {obj.project_id ? (
                      <button
                        onClick={() => handleUnlinkFromProject(obj)}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        title="Quitar del proyecto"
                      >
                        📁 En proyecto <span className="underline">quitar</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => openLinkProjectModal(obj)}
                        className="text-xs text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        + Asignar a proyecto
                      </button>
                    )}
                  </div>

                  {/* Action buttons based on status */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {obj.status !== 'completed' && (
                      <button
                        onClick={() => openAssignModal(obj)}
                        className="chip-primary"
                      >
                        + Asignar dinero
                      </button>
                    )}
                    {current > 0 && obj.status !== 'completed' && (
                      <button
                        onClick={() => openUnassignModal(obj)}
                        className="chip-danger"
                      >
                        - Quitar dinero
                      </button>
                    )}
                    {obj.status === 'completed' && (
                      <>
                        <button
                          onClick={() => openPurchaseModal(obj)}
                          className="chip-success"
                        >
                          🛒 Marcar como comprado
                        </button>
                        <button
                          onClick={() => openUnassignModal(obj)}
                          className="chip-danger"
                        >
                          - Quitar dinero
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(obj)}
                      className="text-xs px-2 py-1.5 text-red-500 font-medium hover:text-red-700 transition-colors ml-auto"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          <section className="card">
            <EmptyState
              message="Tus suenos empiezan aqui. Crea tu primer objetivo."
              actionLabel="+ Nuevo objetivo"
              onAction={() => setShowCreate(true)}
            />
          </section>
        )}

        {/* Historial */}
        {historyObjectives.length > 0 && (
          <section className="space-y-2">
            <h3 className="card-title px-1 mb-0">Historial</h3>
            {historyObjectives.map((obj) => (
              <div key={obj.id} className="bg-white rounded-2xl p-4 shadow-sm opacity-75">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {obj.status === 'purchased' ? '🛒' : '🗑️'} {obj.name}
                  </span>
                  <span className="text-sm text-purple-600 font-medium">
                    {fmt(obj.target_amount)} Bs
                  </span>
                </div>
              </div>
            ))}
          </section>
        )}

        <button
          onClick={() => setShowCreate(true)}
          className="btn-outline h-12 rounded-2xl"
        >
          + Nuevo objetivo
        </button>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo objetivo">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="obj-name" className="label">Nombre</label>
            <input id="obj-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="input"
              placeholder="Ej: Audifonos" />
          </div>
          <div>
            <label htmlFor="obj-amount" className="label">Monto</label>
            <input id="obj-amount" type="number" min="0.01" step="0.01" value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)} required
              className="input"
              placeholder="800.00" />
          </div>
          <div>
            <label htmlFor="obj-desc" className="label">Descripcion (opcional)</label>
            <input id="obj-desc" type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              className="input"
              placeholder="Una descripcion corta..." />
          </div>
          <button type="submit" disabled={submitting}
            className="btn-primary">
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </Modal>

      {/* Assign Money Modal */}
      <Modal isOpen={showAssign !== null} onClose={() => setShowAssign(null)} title="Asignar dinero">
        <form onSubmit={handleAssign} className="space-y-4">
          {showAssign && (
            <p className="text-sm text-gray-500">
              Objetivo: <span className="font-medium text-gray-700">{showAssign.name}</span>
            </p>
          )}
          <div>
            <label htmlFor="assign-source" className="label">
              Fuente de dinero
            </label>
            <select
              id="assign-source"
              value={assignSourceId}
              onChange={(e) => setAssignSourceId(e.target.value)}
              required
              className="input"
            >
              <option value="">Seleccionar fuente...</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({fmt(s.balance)} Bs)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="assign-amount" className="label">Monto a asignar</label>
            <input id="assign-amount" type="number" min="0.01" step="0.01" value={assignAmount}
              onChange={(e) => setAssignAmount(e.target.value)} required
              className="input input-lg"
              placeholder="0.00" />
          </div>
          <button type="submit" disabled={submitting || !assignSourceId}
            className="btn-primary">
            {submitting ? 'Asignando...' : 'Asignar'}
          </button>
        </form>
      </Modal>

      {/* Unassign Money Modal */}
      <Modal isOpen={showUnassign !== null} onClose={() => setShowUnassign(null)} title="Quitar dinero del objetivo">
        <form onSubmit={handleUnassign} className="space-y-4">
          {showUnassign && (
            <p className="text-sm text-gray-500">
              Objetivo: <span className="font-medium text-gray-700">{showUnassign.name}</span>
              <br />
              Asignado actualmente: <span className="font-medium text-gray-700">{fmt(showUnassign.current_amount)} Bs</span>
            </p>
          )}
          <div>
            <label htmlFor="unassign-source" className="label">
              Devolver a fuente
            </label>
            <select
              id="unassign-source"
              value={unassignSourceId}
              onChange={(e) => setUnassignSourceId(e.target.value)}
              required
              className="input"
            >
              <option value="">Seleccionar fuente...</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({fmt(s.balance)} Bs)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="unassign-amount" className="label">Monto a quitar</label>
            <input id="unassign-amount" type="number" min="0.01" step="0.01"
              max={showUnassign ? parseFloat(showUnassign.current_amount) : undefined}
              value={unassignAmount}
              onChange={(e) => setUnassignAmount(e.target.value)} required
              className="input input-lg"
              placeholder="0.00" />
          </div>
          <button type="submit" disabled={submitting || !unassignSourceId}
            className="btn-danger">
            {submitting ? 'Quitando...' : 'Quitar'}
          </button>
        </form>
      </Modal>

      {/* Purchase Confirmation Modal */}
      <Modal isOpen={showPurchase !== null} onClose={() => setShowPurchase(null)} title="Marcar como comprado">
        <form onSubmit={handlePurchase} className="space-y-4">
          {showPurchase && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Vas a marcar <span className="font-bold">{showPurchase.name}</span> como comprado.
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Esto registrara un gasto de <span className="font-bold">{fmt(showPurchase.current_amount)} Bs</span> y el dinero se descontara de la fuente seleccionada.
              </p>
            </div>
          )}
          <div>
            <label htmlFor="purchase-source" className="label">
              ¿De donde salio el dinero?
            </label>
            <select
              id="purchase-source"
              value={purchaseSourceId}
              onChange={(e) => setPurchaseSourceId(e.target.value)}
              required
              className="input"
            >
              <option value="">Seleccionar fuente...</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({fmt(s.balance)} Bs)
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={submitting || !purchaseSourceId}
            className="btn-success">
            {submitting ? 'Procesando...' : '🛒 Confirmar compra'}
          </button>
        </form>
      </Modal>

      {/* Link to Project Modal */}
      <Modal isOpen={showLinkProject !== null} onClose={() => setShowLinkProject(null)} title="Asignar a proyecto">
        <form onSubmit={handleLinkToProject} className="space-y-4">
          {showLinkProject && (
            <p className="text-sm text-gray-500">
              Objetivo: <span className="font-medium text-gray-700">{showLinkProject.name}</span>
            </p>
          )}
          {projects.length > 0 ? (
            <>
              <div>
                <label htmlFor="link-project" className="label">
                  Seleccionar proyecto
                </label>
                <select
                  id="link-project"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  required
                  className="input"
                >
                  <option value="">Seleccionar...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={submitting || !selectedProjectId}
                className="btn-primary">
                {submitting ? 'Asignando...' : 'Asignar a proyecto'}
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              No hay proyectos activos. Crea uno primero en la seccion de Proyectos.
            </p>
          )}
        </form>
      </Modal>
    </>
  );
}

export default ObjectivesPage;
