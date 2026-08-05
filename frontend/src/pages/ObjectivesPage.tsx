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

function ObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState<Objective | null>(null);
  const [showUnassign, setShowUnassign] = useState<Objective | null>(null);
  const [showPurchase, setShowPurchase] = useState<Objective | null>(null);

  // Sources for purchase modal
  const [sources, setSources] = useState<MoneySource[]>([]);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [description, setDescription] = useState('');
  const [assignAmount, setAssignAmount] = useState('');
  const [unassignAmount, setUnassignAmount] = useState('');
  const [purchaseSourceId, setPurchaseSourceId] = useState('');
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
    if (!showAssign) return;
    setSubmitting(true);
    try {
      await apiFetch(`/objectives/${showAssign.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ amount: parseFloat(assignAmount) }),
      });
      setAssignAmount('');
      setShowAssign(null);
      loadData();
    } catch {} finally { setSubmitting(false); }
  };

  const handleUnassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showUnassign) return;
    setSubmitting(true);
    try {
      await apiFetch(`/objectives/${showUnassign.id}/unassign`, {
        method: 'POST',
        body: JSON.stringify({ amount: parseFloat(unassignAmount) }),
      });
      setUnassignAmount('');
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

  const openPurchaseModal = (obj: Objective) => {
    loadSources();
    setShowPurchase(obj);
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
        <div className="text-gray-400 text-sm">Cargando...</div>
      </div>
    );
  }

  const activeObjectives = objectives.filter((o) => o.status !== 'purchased');
  const purchasedObjectives = objectives.filter((o) => o.status === 'purchased');

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
                  className="bg-white rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {status.icon} {obj.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {fmt(obj.current_amount)} / {fmt(obj.target_amount)} Bs
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        obj.status === 'completed' ? 'bg-green-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className={`text-xs font-medium mb-3 ${status.color}`}>{status.label}</p>

                  {/* Action buttons based on status */}
                  <div className="flex flex-wrap gap-2">
                    {obj.status !== 'completed' && (
                      <button
                        onClick={() => setShowAssign(obj)}
                        className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100 transition-colors"
                      >
                        + Asignar dinero
                      </button>
                    )}
                    {current > 0 && obj.status !== 'completed' && (
                      <button
                        onClick={() => setShowUnassign(obj)}
                        className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
                      >
                        − Quitar dinero
                      </button>
                    )}
                    {obj.status === 'completed' && (
                      <>
                        <button
                          onClick={() => openPurchaseModal(obj)}
                          className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors"
                        >
                          🛒 Marcar como comprado
                        </button>
                        <button
                          onClick={() => setShowUnassign(obj)}
                          className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
                        >
                          − Quitar dinero
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <EmptyState
              message="Tus sueños empiezan aquí. Crea tu primer objetivo."
              actionLabel="+ Nuevo objetivo"
              onAction={() => setShowCreate(true)}
            />
          </section>
        )}

        {/* Purchased History */}
        {purchasedObjectives.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 px-1">Historial de compras</h3>
            {purchasedObjectives.map((obj) => (
              <div key={obj.id} className="bg-white rounded-2xl p-4 shadow-sm opacity-75">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    🛒 {obj.name}
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
          className="w-full py-3 bg-white rounded-2xl shadow-sm text-primary-600 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          + Nuevo objetivo
        </button>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo objetivo">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="obj-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input id="obj-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: Audífonos" />
          </div>
          <div>
            <label htmlFor="obj-amount" className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <input id="obj-amount" type="number" min="0.01" step="0.01" value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="800.00" />
          </div>
          <div>
            <label htmlFor="obj-desc" className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <input id="obj-desc" type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Una descripción corta..." />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
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
            <label htmlFor="assign-amount" className="block text-sm font-medium text-gray-700 mb-1">Monto a asignar</label>
            <input id="assign-amount" type="number" min="0.01" step="0.01" value={assignAmount}
              onChange={(e) => setAssignAmount(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              placeholder="0.00" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
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
            <label htmlFor="unassign-amount" className="block text-sm font-medium text-gray-700 mb-1">Monto a quitar</label>
            <input id="unassign-amount" type="number" min="0.01" step="0.01"
              max={showUnassign ? parseFloat(showUnassign.current_amount) : undefined}
              value={unassignAmount}
              onChange={(e) => setUnassignAmount(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              placeholder="0.00" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
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
                Esto registrará un gasto de <span className="font-bold">{fmt(showPurchase.current_amount)} Bs</span> y el dinero se descontará de la fuente seleccionada.
              </p>
            </div>
          )}
          <div>
            <label htmlFor="purchase-source" className="block text-sm font-medium text-gray-700 mb-1">
              ¿De dónde salió el dinero?
            </label>
            <select
              id="purchase-source"
              value={purchaseSourceId}
              onChange={(e) => setPurchaseSourceId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
            {submitting ? 'Procesando...' : '🛒 Confirmar compra'}
          </button>
        </form>
      </Modal>
    </>
  );
}

export default ObjectivesPage;
