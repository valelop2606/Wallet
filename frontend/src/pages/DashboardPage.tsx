import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../services/api';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-sm">Cargando...</div>
      </div>
    );
  }

  const fmt = (n: number | string) => {
    const num = typeof n === 'string' ? parseFloat(n) : n;
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const sourceIcons: Record<string, string> = {
    physical: '💵',
    bank: '🏦',
    other: '📦',
  };

  return (
    <>
      <PageHeader title="Wallet" showLogout />
      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Greeting */}
        <section>
          <p className="text-gray-500 text-sm">Hola 👋</p>
          <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
        </section>

        {/* Available Money */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">💵 Disponible ahora</p>
          <p className="text-3xl font-bold text-gray-900">
            {fmt(data?.available_money ?? 0)} Bs
          </p>
        </section>

        {/* Money Sources */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-3">📍 Dónde está mi dinero</h3>
          {data?.sources && data.sources.length > 0 ? (
            <div className="space-y-2">
              {data.sources.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {sourceIcons[s.type] || '📦'} {s.name}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{fmt(s.balance)} Bs</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Agrega tu primera fuente para comenzar.</p>
          )}
        </section>

        {/* Assigned Money */}
        {data && data.total_assigned > 0 && (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-3">🔒 Dinero asignado</h3>
            {data.active_objectives
              .filter((o) => Number(o.current_amount) > 0)
              .map((obj) => (
                <div key={obj.id} className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">🎯 {obj.name}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {fmt(obj.current_amount)} / {fmt(obj.target_amount)} Bs
                  </span>
                </div>
              ))}
          </section>
        )}

        {/* Savings */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-3">💰 Ahorros</h3>
          {data?.savings && data.savings.length > 0 ? (
            <div className="space-y-2">
              {data.savings.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">💵 {s.name}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {fmt(s.current_amount)}
                    {s.goal_amount ? ` / ${fmt(s.goal_amount)}` : ''} Bs
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Aún no tienes ahorros registrados.</p>
          )}
        </section>

        {/* Patrimony */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">📊 Patrimonio</span>
            <span className="text-lg font-bold text-gray-900">{fmt(data?.patrimony ?? 0)} Bs</span>
          </div>
        </section>

        {/* Reachable Objectives */}
        {data?.reachable_objectives && data.reachable_objectives.length > 0 && (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-3">🎯 Puedes alcanzar</h3>
            <div className="space-y-2">
              {data.reachable_objectives.map((obj) => (
                <div key={obj.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{obj.name}</span>
                  <span className="text-xs text-green-600 font-medium">
                    Faltan {fmt(Number(obj.target_amount) - Number(obj.current_amount))} Bs
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-sm font-medium text-gray-500">⚡ Acciones rápidas</h3>
            <span className="text-gray-400 text-sm">{showQuickActions ? '▲' : '▼'}</span>
          </button>

          {showQuickActions && (
            <div className="mt-4 space-y-4">
              {/* Agregar */}
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">+ Agregar</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowAddMoney(true)}
                    className="text-xs px-3 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors text-left"
                  >
                    💵 Agregar dinero
                  </button>
                  <button
                    onClick={() => navigate('/money/sources')}
                    className="text-xs px-3 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors text-left"
                  >
                    🏦 Crear fuente
                  </button>
                  <button
                    onClick={() => navigate('/plans/objectives')}
                    className="text-xs px-3 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors text-left"
                  >
                    🎯 Crear objetivo
                  </button>
                  <button
                    onClick={() => navigate('/plans/projects')}
                    className="text-xs px-3 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors text-left"
                  >
                    📁 Crear proyecto
                  </button>
                  <button
                    onClick={() => navigate('/savings')}
                    className="text-xs px-3 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors text-left"
                  >
                    💰 Crear ahorro
                  </button>
                  <button
                    onClick={() => setShowExpense(true)}
                    className="text-xs px-3 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors text-left"
                  >
                    💸 Registrar gasto
                  </button>
                  <button
                    onClick={() => setShowTransfer(true)}
                    className="text-xs px-3 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors text-left"
                  >
                    ↔️ Transferencia
                  </button>
                </div>
              </div>

              {/* Quitar */}
              <div>
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">− Quitar</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowExpense(true)}
                    className="text-xs px-3 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors text-left"
                  >
                    💸 Registrar gasto
                  </button>
                  <button
                    onClick={() => setShowWithdraw(true)}
                    className="text-xs px-3 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors text-left"
                  >
                    🏦 Retirar de fuente
                  </button>
                  <button
                    onClick={() => navigate('/plans/objectives')}
                    className="text-xs px-3 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors text-left"
                  >
                    🎯 Quitar de objetivo
                  </button>
                  <button
                    onClick={() => navigate('/plans/projects')}
                    className="text-xs px-3 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors text-left"
                  >
                    📁 Quitar de proyecto
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Recent Transactions */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Movimientos recientes</h3>
          {data?.recent_transactions && data.recent_transactions.length > 0 ? (
            <div className="space-y-3">
              {data.recent_transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      {t.type === 'expense' ? '💸' : t.type === 'income' ? '💵' : '↔️'}{' '}
                      {t.description || t.type}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t.source_name || t.destination_name || ''}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      t.type === 'expense' ? 'text-red-500' : t.type === 'income' ? 'text-green-600' : 'text-gray-700'
                    }`}
                  >
                    {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}{fmt(t.amount)} Bs
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Sin movimientos registrados.</p>
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
            <label htmlFor="qa-dest" className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
            <select id="qa-dest" value={qDestId} onChange={(e) => setQDestId(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">Seleccionar fuente...</option>
              {data?.sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({fmt(s.balance)} Bs)</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="qa-amount" className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <input id="qa-amount" type="number" min="0.01" step="0.01" value={qAmount}
              onChange={(e) => setQAmount(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              placeholder="0.00" />
          </div>
          <div>
            <label htmlFor="qa-desc" className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <input id="qa-desc" type="text" value={qDescription} onChange={(e) => setQDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: Salario" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
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
            <label htmlFor="qe-source" className="block text-sm font-medium text-gray-700 mb-1">Fuente</label>
            <select id="qe-source" value={qSourceId} onChange={(e) => setQSourceId(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">Seleccionar fuente...</option>
              {data?.sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({fmt(s.balance)} Bs)</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="qe-amount" className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <input id="qe-amount" type="number" min="0.01" step="0.01" value={qAmount}
              onChange={(e) => setQAmount(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              placeholder="0.00" />
          </div>
          <div>
            <label htmlFor="qe-desc" className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <input id="qe-desc" type="text" value={qDescription} onChange={(e) => setQDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: Almuerzo" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
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
            <label htmlFor="qt-source" className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
            <select id="qt-source" value={qSourceId} onChange={(e) => setQSourceId(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">Seleccionar fuente...</option>
              {data?.sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({fmt(s.balance)} Bs)</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="qt-dest" className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
            <select id="qt-dest" value={qDestId} onChange={(e) => setQDestId(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">Seleccionar destino...</option>
              {data?.sources.filter(s => s.id.toString() !== qSourceId).map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({fmt(s.balance)} Bs)</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="qt-amount" className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <input id="qt-amount" type="number" min="0.01" step="0.01" value={qAmount}
              onChange={(e) => setQAmount(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              placeholder="0.00" />
          </div>
          <div>
            <label htmlFor="qt-desc" className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <input id="qt-desc" type="text" value={qDescription} onChange={(e) => setQDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: Mover a banco" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
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
            <label htmlFor="qw-source" className="block text-sm font-medium text-gray-700 mb-1">Fuente</label>
            <select id="qw-source" value={qSourceId} onChange={(e) => setQSourceId(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">Seleccionar fuente...</option>
              {data?.sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({fmt(s.balance)} Bs)</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="qw-amount" className="block text-sm font-medium text-gray-700 mb-1">Monto a retirar</label>
            <input id="qw-amount" type="number" min="0.01" step="0.01" value={qAmount}
              onChange={(e) => setQAmount(e.target.value)} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              placeholder="0.00" />
          </div>
          <div>
            <label htmlFor="qw-desc" className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <input id="qw-desc" type="text" value={qDescription} onChange={(e) => setQDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: Retiro cajero" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
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
