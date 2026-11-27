import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

interface Saving {
  id: number;
  name: string;
  description: string | null;
  current_amount: string;
  goal_amount: string | null;
}

interface MoneySource {
  id: number;
  name: string;
  type: string;
  balance: string;
}

function SavingsPage() {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [sources, setSources] = useState<MoneySource[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showDeposit, setShowDeposit] = useState<Saving | null>(null);
  const [showWithdraw, setShowWithdraw] = useState<Saving | null>(null);
  const [showEdit, setShowEdit] = useState<Saving | null>(null);

  const [name, setName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositSourceId, setDepositSourceId] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDestId, setWithdrawDestId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit form
  const [editName, setEditName] = useState('');
  const [editGoal, setEditGoal] = useState('');

  const loadData = () => {
    apiFetch<{ savings: Saving[]; total: number }>('/savings')
      .then((data) => { setSavings(data.savings); setTotal(data.total); })
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
      await apiFetch('/savings', {
        method: 'POST',
        body: JSON.stringify({
          name,
          goal_amount: goalAmount ? parseFloat(goalAmount) : undefined,
        }),
      });
      setName(''); setGoalAmount('');
      setShowCreate(false);
      loadData();
    } catch {} finally { setSubmitting(false); }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDeposit || !depositSourceId) return;
    setSubmitting(true);
    try {
      await apiFetch(`/savings/${showDeposit.id}/deposit`, {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          source_id: parseInt(depositSourceId),
        }),
      });
      setDepositAmount('');
      setDepositSourceId('');
      setShowDeposit(null);
      loadData();
    } catch {} finally { setSubmitting(false); }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showWithdraw || !withdrawDestId) return;
    setSubmitting(true);
    try {
      await apiFetch(`/savings/${showWithdraw.id}/withdraw`, {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          destination_id: parseInt(withdrawDestId),
        }),
      });
      setWithdrawAmount('');
      setWithdrawDestId('');
      setShowWithdraw(null);
      loadData();
    } catch {} finally { setSubmitting(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;
    setSubmitting(true);
    try {
      await apiFetch(`/savings/${showEdit.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editName,
          goal_amount: editGoal ? parseFloat(editGoal) : null,
        }),
      });
      setShowEdit(null);
      loadData();
    } catch {} finally { setSubmitting(false); }
  };

  const openDepositModal = (s: Saving) => {
    loadSources();
    setShowDeposit(s);
  };

  const openWithdrawModal = (s: Saving) => {
    loadSources();
    setShowWithdraw(s);
  };

  const openEditModal = (s: Saving) => {
    setEditName(s.name);
    setEditGoal(s.goal_amount ? parseFloat(s.goal_amount).toString() : '');
    setShowEdit(s);
  };

  const fmt = (n: string | number) => {
    const num = typeof n === 'string' ? parseFloat(n) : n;
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 rounded-full border-2 border-primary-600 border-r-transparent animate-spin" role="status" aria-label="Cargando" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Mis ahorros" />
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Total */}
        <section className="card">
          <p className="text-sm text-gray-500 mb-1">Total ahorrado</p>
          <p className="text-2xl font-bold text-gray-900 amount">{fmt(total)} Bs</p>
        </section>

        {/* Savings List */}
        {savings.length > 0 ? (
          <section className="space-y-3">
            {savings.map((s) => {
              const current = parseFloat(s.current_amount);
              const goal = s.goal_amount ? parseFloat(s.goal_amount) : null;
              const progress = goal ? Math.min((current / goal) * 100, 100) : null;
              return (
                <div key={s.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">💵 {s.name}</span>
                    <span className="text-sm font-semibold text-gray-900 amount">
                      {fmt(s.current_amount)}{goal ? ` / ${fmt(s.goal_amount!)}` : ''} Bs
                    </span>
                  </div>
                  {progress !== null && (
                    <div className="progress mb-3">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-[width] duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDepositModal(s)}
                      className="chip-primary"
                    >
                      + Depositar
                    </button>
                    {current > 0 && (
                      <button
                        onClick={() => openWithdrawModal(s)}
                        className="chip-danger"
                      >
                        - Retirar
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(s)}
                      className="chip-neutral"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          <section className="card">
            <EmptyState
              message="Aun no tienes ahorros. Crea tu primer espacio de ahorro."
              actionLabel="+ Nuevo ahorro"
              onAction={() => setShowCreate(true)}
            />
          </section>
        )}

        <button
          onClick={() => setShowCreate(true)}
          className="btn-outline h-12 rounded-2xl"
        >
          + Nuevo ahorro
        </button>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo ahorro">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="sav-name" className="label">Nombre</label>
            <input id="sav-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="input"
              placeholder="Ej: Fondo de emergencia" />
          </div>
          <div>
            <label htmlFor="sav-goal" className="label">Meta (opcional)</label>
            <input id="sav-goal" type="number" min="0" step="0.01" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)}
              className="input"
              placeholder="0.00" />
          </div>
          <button type="submit" disabled={submitting}
            className="btn-primary">
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </Modal>

      {/* Deposit Modal */}
      <Modal isOpen={showDeposit !== null} onClose={() => setShowDeposit(null)} title="Depositar a ahorro">
        <form onSubmit={handleDeposit} className="space-y-4">
          {showDeposit && (
            <p className="text-sm text-gray-500">
              Ahorro: <span className="font-medium text-gray-700">{showDeposit.name}</span>
            </p>
          )}
          <div>
            <label htmlFor="dep-source" className="label">Sacar de</label>
            <select
              id="dep-source"
              value={depositSourceId}
              onChange={(e) => setDepositSourceId(e.target.value)}
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
            <label htmlFor="dep-amount" className="label">Monto a depositar</label>
            <input id="dep-amount" type="number" min="0.01" step="0.01" value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)} required
              className="input input-lg"
              placeholder="0.00" />
          </div>
          <button type="submit" disabled={submitting || !depositSourceId}
            className="btn-primary">
            {submitting ? 'Depositando...' : 'Depositar'}
          </button>
        </form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={showWithdraw !== null} onClose={() => setShowWithdraw(null)} title="Retirar de ahorro">
        <form onSubmit={handleWithdraw} className="space-y-4">
          {showWithdraw && (
            <p className="text-sm text-gray-500">
              Ahorro: <span className="font-medium text-gray-700">{showWithdraw.name}</span>
              <br />
              Disponible: <span className="font-medium text-gray-700">{fmt(showWithdraw.current_amount)} Bs</span>
            </p>
          )}
          <div>
            <label htmlFor="wd-dest" className="label">Enviar a</label>
            <select
              id="wd-dest"
              value={withdrawDestId}
              onChange={(e) => setWithdrawDestId(e.target.value)}
              required
              className="input"
            >
              <option value="">Seleccionar destino...</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({fmt(s.balance)} Bs)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="wd-amount" className="label">Monto a retirar</label>
            <input id="wd-amount" type="number" min="0.01" step="0.01"
              max={showWithdraw ? parseFloat(showWithdraw.current_amount) : undefined}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)} required
              className="input input-lg"
              placeholder="0.00" />
          </div>
          <button type="submit" disabled={submitting || !withdrawDestId}
            className="btn-danger">
            {submitting ? 'Retirando...' : 'Retirar'}
          </button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEdit !== null} onClose={() => setShowEdit(null)} title="Editar ahorro">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label htmlFor="edit-sav-name" className="label">Nombre</label>
            <input id="edit-sav-name" type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required
              className="input"
              placeholder="Nombre del ahorro" />
          </div>
          <div>
            <label htmlFor="edit-sav-goal" className="label">Meta (opcional)</label>
            <input id="edit-sav-goal" type="number" min="0" step="0.01" value={editGoal} onChange={(e) => setEditGoal(e.target.value)}
              className="input"
              placeholder="Dejar vacio para quitar meta" />
            <p className="text-xs text-gray-400 mt-1">Deja vacio para quitar la meta.</p>
          </div>
          <button type="submit" disabled={submitting}
            className="btn-primary">
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </Modal>
    </>
  );
}

export default SavingsPage;
