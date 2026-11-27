import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../services/api';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import Icon, { IconName } from '../components/Icon';

interface MoneySource {
  id: number;
  name: string;
  type: string;
  balance: string;
}

interface Saving {
  id: number;
  name: string;
  current_amount: string;
  goal_amount: string | null;
}

interface Objective {
  id: number;
  name: string;
  target_amount: string;
  current_amount: string;
  status: string;
}

interface Project {
  id: number;
  name: string;
  status: string;
  objectives_total: string;
  objectives_current: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: string;
  description: string | null;
  source_name: string | null;
  destination_name: string | null;
  date: string;
}

interface DashboardData {
  available_money: number;
  total_balance: number;
  total_assigned: number;
  total_savings: number;
  patrimony: number;
  sources: MoneySource[];
  savings: Saving[];
  active_objectives: Objective[];
  active_projects: Project[];
  reachable_objectives: Objective[];
  recent_transactions: Transaction[];
}

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Quick action modals
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Form state
  const [qAmount, setQAmount] = useState('');
  const [qSourceId, setQSourceId] = useState('');
  const [qDestId, setQDestId] = useState('');
  const [qDescription, setQDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadDashboard = () => {
    apiFetch<DashboardData>('/dashboard')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDashboard(); }, []);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-20 space-y-4" aria-busy="true" aria-label="Cargando">
        <div className="h-40 rounded-3xl bg-gray-200/70 animate-pulse" />
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-200/70 animate-pulse" />
          ))}
        </div>
        <div className="h-36 rounded-2xl bg-gray-200/70 animate-pulse" />
      </div>
    );
  }

  const fmt = (n: number | string) => {
    const num = typeof n === 'string' ? parseFloat(n) : n;
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const sourceIcons: Record<string, IconName> = {
    physical: 'coins',
    bank: 'wallet',
    other: 'folder',
  };

  const firstName = user?.name?.split(' ')[0] ?? '';
  const initial = (user?.name?.trim()[0] ?? '?').toUpperCase();

  const primaryActions: { label: string; icon: IconName; onClick: () => void; tone: string }[] = [
    { label: 'Ingreso', icon: 'arrowDown', onClick: () => setShowAddMoney(true), tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Gasto', icon: 'arrowUp', onClick: () => setShowExpense(true), tone: 'bg-red-50 text-red-600' },
    { label: 'Transferir', icon: 'arrows', onClick: () => setShowTransfer(true), tone: 'bg-sky-50 text-sky-700' },
    { label: 'Retirar', icon: 'minus', onClick: () => setShowWithdraw(true), tone: 'bg-amber-50 text-amber-700' },
  ];

  const moreActions: { label: string; icon: IconName; onClick: () => void }[] = [
    { label: 'Crear fuente', icon: 'wallet', onClick: () => navigate('/money/sources') },
    { label: 'Crear objetivo', icon: 'target', onClick: () => navigate('/plans/objectives') },
    { label: 'Crear proyecto', icon: 'folder', onClick: () => navigate('/plans/projects') },
    { label: 'Crear ahorro', icon: 'piggy', onClick: () => navigate('/savings') },
    { label: 'Quitar de objetivo', icon: 'target', onClick: () => navigate('/plans/objectives') },
    { label: 'Quitar de proyecto', icon: 'folder', onClick: () => navigate('/plans/projects') },
  ];

  const Row = ({ icon, label, sub, value, valueClass = 'text-gray-900' }: { icon: IconName; label: string; sub?: string; value: string; valueClass?: string }) => (
    <div className="flex items-center gap-3 py-2.5">
      <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 text-gray-500 shrink-0">
        <Icon name={icon} size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 truncate">{label}</p>
        {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
      </div>
      <span className={`text-sm font-semibold amount shrink-0 ${valueClass}`}>{value}</span>
    </div>
  );

  return (
    <>
      <PageHeader title="Wallet" showLogout />
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Greeting */}
        <section className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold">
            {initial}
          </span>
          <div>
            <p className="text-xs text-gray-500">Hola,</p>
            <h2 className="text-base font-bold text-gray-900 leading-tight">{firstName}</h2>
          </div>
        </section>

        {/* Hero balance */}
        <section className="relative overflow-hidden rounded-3xl p-5 text-white bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 shadow-lift">
          <div className="pointer-events-none absolute -right-10 -top-12 w-44 h-44 rounded-full bg-white/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-2 top-16 w-24 h-24 rounded-full bg-white/5" aria-hidden="true" />
          <p className="text-sm text-primary-100/90 font-medium">Disponible ahora</p>
          <p className="mt-1 text-4xl font-bold amount">
            {fmt(data?.available_money ?? 0)}
            <span className="ml-1.5 text-lg font-semibold text-primary-100/80">Bs</span>
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-white/10 px-3 py-2">
              <p className="text-primary-100/80">Asignado</p>
              <p className="mt-0.5 font-semibold amount">{fmt(data?.total_assigned ?? 0)}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2">
              <p className="text-primary-100/80">Ahorros</p>
              <p className="mt-0.5 font-semibold amount">{fmt(data?.total_savings ?? 0)}</p>
            </div>
            <div className="rounded-xl bg-white/15 px-3 py-2">
              <p className="text-primary-100/80">Patrimonio</p>
              <p className="mt-0.5 font-semibold amount">{fmt(data?.patrimony ?? 0)}</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section aria-label="Acciones rápidas">
          <div className="grid grid-cols-4 gap-2">
            {primaryActions.map((a) => (
              <button
                key={a.label}
                onClick={a.onClick}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white border border-gray-100 shadow-card transition-transform duration-150 ease-out active:scale-[0.96]"
              >
                <span className={`flex items-center justify-center w-9 h-9 rounded-full ${a.tone}`}>
                  <Icon name={a.icon} size={18} strokeWidth={2.1} />
                </span>
                <span className="text-xs font-semibold text-gray-700">{a.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="mt-2 w-full flex items-center justify-center gap-1 h-9 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            aria-expanded={showQuickActions}
          >
            Más acciones
            <Icon
              name="chevron"
              size={14}
              className={`transition-transform duration-200 ${showQuickActions ? 'rotate-180' : ''}`}
            />
          </button>
          {showQuickActions && (
            <div className="grid grid-cols-2 gap-2">
              {moreActions.map((a) => (
                <button
                  key={a.label}
                  onClick={a.onClick}
                  className="flex items-center gap-2 px-3 h-11 rounded-xl bg-white border border-gray-100 text-sm font-medium text-gray-700 text-left hover:border-gray-200 transition-[border-color,transform] duration-150 active:scale-[0.97]"
                >
                  <Icon name={a.icon} size={16} className="text-gray-400 shrink-0" />
                  <span className="truncate">{a.label}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Money Sources */}
        <section className="card py-4">
          <h3 className="card-title mb-1">
            <Icon name="wallet" size={15} /> Dónde está mi dinero
          </h3>
          {data?.sources && data.sources.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.sources.map((s) => (
                <Row key={s.id} icon={sourceIcons[s.type] || 'folder'} label={s.name} value={`${fmt(s.balance)} Bs`} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-2">Agrega tu primera fuente para comenzar.</p>
          )}
        </section>

        {/* Assigned Money */}
        {data && data.total_assigned > 0 && (
          <section className="card py-4">
            <h3 className="card-title mb-2">
              <Icon name="lock" size={15} /> Dinero asignado
            </h3>
            <div className="space-y-3">
              {data.active_objectives
                .filter((o) => Number(o.current_amount) > 0)
                .map((obj) => {
                  const pct = Math.min(100, (Number(obj.current_amount) / Math.max(1, Number(obj.target_amount))) * 100);
                  return (
                    <div key={obj.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-800 truncate">{obj.name}</span>
                        <span className="text-xs text-gray-500 amount">
                          <span className="font-semibold text-gray-900">{fmt(obj.current_amount)}</span> / {fmt(obj.target_amount)} Bs
                        </span>
                      </div>
                      <div className="progress h-1.5">
                        <div className="h-full rounded-full bg-primary-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* Savings */}
        <section className="card py-4">
          <h3 className="card-title mb-1">
            <Icon name="piggy" size={15} /> Ahorros
          </h3>
          {data?.savings && data.savings.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.savings.map((s) => (
                <Row
                  key={s.id}
                  icon="piggy"
                  label={s.name}
                  sub={s.goal_amount ? `Meta: ${fmt(s.goal_amount)} Bs` : undefined}
                  value={`${fmt(s.current_amount)} Bs`}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-2">Aún no tienes ahorros registrados.</p>
          )}
        </section>

        {/* Reachable Objectives */}
        {data?.reachable_objectives && data.reachable_objectives.length > 0 && (
          <section className="card py-4 border-emerald-100 bg-gradient-to-b from-emerald-50/60 to-white">
            <h3 className="card-title mb-1 text-emerald-700">
              <Icon name="target" size={15} /> Puedes alcanzar
            </h3>
            <div className="divide-y divide-emerald-100/70">
              {data.reachable_objectives.map((obj) => (
                <div key={obj.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm font-medium text-gray-800">{obj.name}</span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 rounded-full px-2.5 py-1 amount">
                    Faltan {fmt(Number(obj.target_amount) - Number(obj.current_amount))} Bs
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Transactions */}
        <section className="card py-4">
          <h3 className="card-title mb-1">
            <Icon name="list" size={15} /> Movimientos recientes
          </h3>
          {data?.recent_transactions && data.recent_transactions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {data.recent_transactions.map((t) => {
                const isExpense = t.type === 'expense';
                const isIncome = t.type === 'income';
                return (
                  <div key={t.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
                        isExpense ? 'bg-red-50 text-red-500' : isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'
                      }`}
                    >
                      <Icon name={isExpense ? 'arrowUp' : isIncome ? 'arrowDown' : 'arrows'} size={16} strokeWidth={2.1} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{t.description || t.type}</p>
                      <p className="text-xs text-gray-400 truncate">{t.source_name || t.destination_name || ''}</p>
                    </div>
                    <span
                      className={`text-sm font-semibold amount shrink-0 ${
                        isExpense ? 'text-red-500' : isIncome ? 'text-emerald-600' : 'text-gray-700'
                      }`}
                    >
                      {isExpense ? '−' : isIncome ? '+' : ''}
                      {fmt(t.amount)} Bs
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm py-2">Sin movimientos registrados.</p>
          )}
        </section>
      </div>

      {/* Add Money Modal (Income) */}
      <Modal isOpen={showAddMoney} onClose={() => { setShowAddMoney(false); resetForm(); }} title="Agregar dinero">
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!qDestId || !qAmount) return;
          setSubmitting(true);
          try {
            await apiFetch('/transactions', {
              method: 'POST',
              body: JSON.stringify({
                type: 'income',
                amount: parseFloat(qAmount),
                destination_id: parseInt(qDestId),
                description: qDescription || 'Ingreso',
              }),
            });
            setShowAddMoney(false);
            resetForm();
            loadDashboard();
          } catch {} finally { setSubmitting(false); }
        }} className="space-y-4">
          <div>
            <label htmlFor="qa-dest" className="label">Destino</label>
            <select id="qa-dest" value={qDestId} onChange={(e) => setQDestId(e.target.value)} required
              className="input">
              <option value="">Seleccionar fuente...</option>
              {data?.sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({fmt(s.balance)} Bs)</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="qa-amount" className="label">Monto</label>
            <input id="qa-amount" type="number" min="0.01" step="0.01" value={qAmount}
              onChange={(e) => setQAmount(e.target.value)} required
              className="input input-lg"
              placeholder="0.00" />
          </div>
          <div>
            <label htmlFor="qa-desc" className="label">Descripción (opcional)</label>
            <input id="qa-desc" type="text" value={qDescription} onChange={(e) => setQDescription(e.target.value)}
              className="input"
              placeholder="Ej: Salario" />
          </div>
          <button type="submit" disabled={submitting}
            className="btn-success">
            {submitting ? 'Guardando...' : '+ Agregar'}
          </button>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={showExpense} onClose={() => { setShowExpense(false); resetForm(); }} title="Registrar gasto">
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!qSourceId || !qAmount) return;
          setSubmitting(true);
          try {
            await apiFetch('/transactions', {
              method: 'POST',
              body: JSON.stringify({
                type: 'expense',
                amount: parseFloat(qAmount),
                source_id: parseInt(qSourceId),
                description: qDescription || 'Gasto',
              }),
            });
            setShowExpense(false);
            resetForm();
            loadDashboard();
          } catch {} finally { setSubmitting(false); }
        }} className="space-y-4">
          <div>
            <label htmlFor="qe-source" className="label">Fuente</label>
            <select id="qe-source" value={qSourceId} onChange={(e) => setQSourceId(e.target.value)} required
              className="input">
              <option value="">Seleccionar fuente...</option>
              {data?.sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({fmt(s.balance)} Bs)</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="qe-amount" className="label">Monto</label>
            <input id="qe-amount" type="number" min="0.01" step="0.01" value={qAmount}
              onChange={(e) => setQAmount(e.target.value)} required
              className="input input-lg"
              placeholder="0.00" />
          </div>
          <div>
            <label htmlFor="qe-desc" className="label">Descripción (opcional)</label>
            <input id="qe-desc" type="text" value={qDescription} onChange={(e) => setQDescription(e.target.value)}
              className="input"
              placeholder="Ej: Almuerzo" />
          </div>
          <button type="submit" disabled={submitting}
            className="btn-danger">
            {submitting ? 'Guardando...' : '− Registrar gasto'}
          </button>
        </form>
      </Modal>

      {/* Transfer Modal */}
      <Modal isOpen={showTransfer} onClose={() => { setShowTransfer(false); resetForm(); }} title="Transferencia">
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!qSourceId || !qDestId || !qAmount) return;
          setSubmitting(true);
          try {
            await apiFetch('/transactions', {
              method: 'POST',
              body: JSON.stringify({
                type: 'transfer',
                amount: parseFloat(qAmount),
                source_id: parseInt(qSourceId),
                destination_id: parseInt(qDestId),
                description: qDescription || 'Transferencia',
              }),
            });
            setShowTransfer(false);
            resetForm();
            loadDashboard();
          } catch {} finally { setSubmitting(false); }
        }} className="space-y-4">
          <div>
            <label htmlFor="qt-source" className="label">Origen</label>
            <select id="qt-source" value={qSourceId} onChange={(e) => setQSourceId(e.target.value)} required
              className="input">
              <option value="">Seleccionar fuente...</option>
              {data?.sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({fmt(s.balance)} Bs)</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="qt-dest" className="label">Destino</label>
            <select id="qt-dest" value={qDestId} onChange={(e) => setQDestId(e.target.value)} required
              className="input">
              <option value="">Seleccionar destino...</option>
              {data?.sources.filter(s => s.id.toString() !== qSourceId).map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({fmt(s.balance)} Bs)</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="qt-amount" className="label">Monto</label>
            <input id="qt-amount" type="number" min="0.01" step="0.01" value={qAmount}
              onChange={(e) => setQAmount(e.target.value)} required
              className="input input-lg"
              placeholder="0.00" />
          </div>
          <div>
            <label htmlFor="qt-desc" className="label">Descripción (opcional)</label>
            <input id="qt-desc" type="text" value={qDescription} onChange={(e) => setQDescription(e.target.value)}
              className="input"
              placeholder="Ej: Mover a banco" />
          </div>
          <button type="submit" disabled={submitting}
            className="btn-primary">
            {submitting ? 'Transfiriendo...' : '↔️ Transferir'}
          </button>
        </form>
      </Modal>

      {/* Withdraw from Source Modal */}
      <Modal isOpen={showWithdraw} onClose={() => { setShowWithdraw(false); resetForm(); }} title="Retirar de fuente">
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!qSourceId || !qAmount) return;
          setSubmitting(true);
          try {
            await apiFetch('/transactions', {
              method: 'POST',
              body: JSON.stringify({
                type: 'expense',
                amount: parseFloat(qAmount),
                source_id: parseInt(qSourceId),
                description: qDescription || 'Retiro',
                category: 'withdrawal',
              }),
            });
            setShowWithdraw(false);
            resetForm();
            loadDashboard();
          } catch {} finally { setSubmitting(false); }
        }} className="space-y-4">
          <div>
            <label htmlFor="qw-source" className="label">Fuente</label>
            <select id="qw-source" value={qSourceId} onChange={(e) => setQSourceId(e.target.value)} required
              className="input">
              <option value="">Seleccionar fuente...</option>
              {data?.sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({fmt(s.balance)} Bs)</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="qw-amount" className="label">Monto a retirar</label>
            <input id="qw-amount" type="number" min="0.01" step="0.01" value={qAmount}
              onChange={(e) => setQAmount(e.target.value)} required
              className="input input-lg"
              placeholder="0.00" />
          </div>
          <div>
            <label htmlFor="qw-desc" className="label">Descripción (opcional)</label>
            <input id="qw-desc" type="text" value={qDescription} onChange={(e) => setQDescription(e.target.value)}
              className="input"
              placeholder="Ej: Retiro cajero" />
          </div>
          <button type="submit" disabled={submitting}
            className="btn-danger">
            {submitting ? 'Retirando...' : '− Retirar'}
          </button>
        </form>
      </Modal>
    </>
  );

  function resetForm() {
    setQAmount('');
    setQSourceId('');
    setQDestId('');
    setQDescription('');
  }
}

export default DashboardPage;
