import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

interface MoneySource {
  id: number;
  name: string;
  type: string;
  balance: string;
}

interface Modification {
  id: number;
  field: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: string;
  description: string | null;
  source_id: number | null;
  destination_id: number | null;
  source_name: string | null;
  destination_name: string | null;
  date: string;
}

interface TransactionDetail extends Transaction {
  modifications: Modification[];
}

function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sources, setSources] = useState<MoneySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<TransactionDetail | null>(null);
  const [showHistory, setShowHistory] = useState<TransactionDetail | null>(null);
  const [txType, setTxType] = useState<'expense' | 'income' | 'transfer'>('expense');

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit form state
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const loadData = async () => {
    try {
      const [txData, srcData] = await Promise.all([
        apiFetch<{ transactions: Transaction[] }>('/transactions'),
        apiFetch<{ sources: MoneySource[] }>('/sources'),
      ]);
      setTransactions(txData.transactions);
      setSources(srcData.sources);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        type: txType,
        amount: parseFloat(amount),
        description: description || undefined,
      };
      if (txType === 'expense') body.source_id = parseInt(sourceId);
      if (txType === 'income') body.destination_id = parseInt(destinationId);
      if (txType === 'transfer') {
        body.source_id = parseInt(sourceId);
        body.destination_id = parseInt(destinationId);
      }

      await apiFetch('/transactions', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      resetCreateForm();
      setShowCreate(false);
      loadData();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;
    setSubmitting(true);
    try {
      await apiFetch(`/transactions/${showEdit.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          description: editDescription,
          amount: parseFloat(editAmount),
        }),
      });
      setShowEdit(null);
      loadData();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoid = async (tx: Transaction) => {
    if (!confirm('¿Anular esta transaccion? Se revertira el saldo.')) return;
    try {
      await apiFetch(`/transactions/${tx.id}/void`, { method: 'POST' });
      setShowEdit(null);
      loadData();
    } catch {}
  };

  const openEditModal = async (tx: Transaction) => {
    try {
      const detail = await apiFetch<TransactionDetail>(`/transactions/${tx.id}`);
      setEditAmount(parseFloat(detail.amount).toString());
      setEditDescription(detail.description || '');
      setShowEdit(detail);
    } catch {}
  };

  const openHistoryModal = async (tx: Transaction) => {
    try {
      const detail = await apiFetch<TransactionDetail>(`/transactions/${tx.id}`);
      setShowHistory(detail);
    } catch {}
  };

  const resetCreateForm = () => {
    setAmount('');
    setDescription('');
    setSourceId('');
    setDestinationId('');
  };

  const fmt = (n: string | number) => {
    const num = typeof n === 'string' ? parseFloat(n) : n;
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short' });
  };

  const formatDateTime = (d: string) => {
    return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const txLabel = (type: string) => {
    if (type === 'expense') return 'Gasto';
    if (type === 'income') return 'Ingreso';
    return 'Transferencia';
  };

  const txIcon = (type: string) => {
    if (type === 'expense') return '💸';
    if (type === 'income') return '💵';
    return '↔️';
  };

  const fieldLabel = (field: string) => {
    if (field === 'amount') return 'Monto';
    if (field === 'description') return 'Descripcion';
    return field;
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
        {/* Quick Actions */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-3">¿Que quieres hacer?</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => { setTxType('expense'); setShowCreate(true); }}
              className="flex flex-col items-center gap-1 py-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
            >
              <span className="text-lg">💸</span>
              <span className="text-xs font-medium text-red-600">Gastar</span>
            </button>
            <button
              onClick={() => { setTxType('income'); setShowCreate(true); }}
              className="flex flex-col items-center gap-1 py-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors"
            >
              <span className="text-lg">💰</span>
              <span className="text-xs font-medium text-green-600">Recibir</span>
            </button>
            <button
              onClick={() => { setTxType('transfer'); setShowCreate(true); }}
              className="flex flex-col items-center gap-1 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <span className="text-lg">↔️</span>
              <span className="text-xs font-medium text-blue-600">Transferir</span>
            </button>
          </div>
        </section>

        {/* Transaction History */}
        {transactions.length > 0 ? (
          <section className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Historial</h3>
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openHistoryModal(t)}>
                  <p className="text-sm text-gray-700">
                    {txIcon(t.type)} {txLabel(t.type)}
                    {t.description ? ` — ${t.description}` : ''}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(t.date)} • {t.source_name || t.destination_name || ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      t.type === 'expense' ? 'text-red-500' : t.type === 'income' ? 'text-green-600' : 'text-gray-700'
                    }`}
                  >
                    {t.type === 'expense' ? '-' : t.type === 'income' ? '+' : ''}{fmt(t.amount)} Bs
                  </span>
                  <button
                    onClick={() => openEditModal(t)}
                    className="text-gray-400 hover:text-primary-600 p-1 transition-colors"
                    title="Editar"
                    aria-label="Editar transaccion"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <EmptyState message="Sin movimientos registrados." />
          </section>
        )}
      </div>

      {/* Create Transaction Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); resetCreateForm(); }}
        title={txType === 'expense' ? 'Registrar gasto' : txType === 'income' ? 'Registrar ingreso' : 'Transferir'}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="tx-amount" className="block text-sm font-medium text-gray-700 mb-1">
              Monto
            </label>
            <input
              id="tx-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              placeholder="0.00"
            />
          </div>

          {(txType === 'expense' || txType === 'transfer') && (
            <div>
              <label htmlFor="tx-source" className="block text-sm font-medium text-gray-700 mb-1">
                {txType === 'transfer' ? 'Origen' : 'Sale de'}
              </label>
              <select
                id="tx-source"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Seleccionar fuente</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({fmt(s.balance)} Bs)</option>
                ))}
              </select>
            </div>
          )}

          {(txType === 'income' || txType === 'transfer') && (
            <div>
              <label htmlFor="tx-dest" className="block text-sm font-medium text-gray-700 mb-1">
                {txType === 'transfer' ? 'Destino' : 'Recibir en'}
              </label>
              <select
                id="tx-dest"
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Seleccionar fuente</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({fmt(s.balance)} Bs)</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="tx-desc" className="block text-sm font-medium text-gray-700 mb-1">
              Descripcion (opcional)
            </label>
            <input
              id="tx-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: Mini, Almuerzo..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </Modal>

      {/* Edit Transaction Modal */}
      <Modal
        isOpen={showEdit !== null}
        onClose={() => setShowEdit(null)}
        title="Editar transaccion"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          {showEdit && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              <p className="font-medium">
                {txIcon(showEdit.type)} {txLabel(showEdit.type)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(showEdit.date)}
                {showEdit.source_name && ` • De: ${showEdit.source_name}`}
                {showEdit.destination_name && ` • A: ${showEdit.destination_name}`}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-700 mb-1">
              Monto
            </label>
            <input
              id="edit-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              placeholder="0.00"
            />
          </div>

          <div>
            <label htmlFor="edit-desc" className="block text-sm font-medium text-gray-700 mb-1">
              Descripcion (opcional)
            </label>
            <input
              id="edit-desc"
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Descripcion..."
            />
          </div>

          {/* Modification History */}
          {showEdit && showEdit.modifications.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Historial de cambios</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {showEdit.modifications.map((mod) => (
                  <div key={mod.id} className="text-xs text-gray-400 bg-gray-50 rounded p-2">
                    <span className="font-medium text-gray-600">{fieldLabel(mod.field)}</span>
                    {': '}
                    <span className="line-through text-red-400">{mod.old_value || '(vacio)'}</span>
                    {' → '}
                    <span className="text-green-600">{mod.new_value || '(vacio)'}</span>
                    <span className="block text-gray-300 mt-0.5">{formatDateTime(mod.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={() => showEdit && handleVoid(showEdit)}
              className="py-2 px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
            >
              Anular
            </button>
          </div>
        </form>
      </Modal>

      {/* Transaction Detail / History Modal */}
      <Modal
        isOpen={showHistory !== null}
        onClose={() => setShowHistory(null)}
        title="Detalle de transaccion"
      >
        {showHistory && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {txIcon(showHistory.type)} {txLabel(showHistory.type)}
                </span>
                <span className={`text-lg font-bold ${
                  showHistory.type === 'expense' ? 'text-red-500' : showHistory.type === 'income' ? 'text-green-600' : 'text-gray-800'
                }`}>
                  {showHistory.type === 'expense' ? '-' : showHistory.type === 'income' ? '+' : ''}{fmt(showHistory.amount)} Bs
                </span>
              </div>
              {showHistory.description && (
                <p className="text-sm text-gray-500">{showHistory.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {formatDateTime(showHistory.date)}
                {showHistory.source_name && ` • De: ${showHistory.source_name}`}
                {showHistory.destination_name && ` • A: ${showHistory.destination_name}`}
              </p>
            </div>

            {showHistory.modifications.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Historial de modificaciones</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {showHistory.modifications.map((mod) => (
                    <div key={mod.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">{fieldLabel(mod.field)}</span>
                        <span className="text-xs text-gray-400">{formatDateTime(mod.created_at)}</span>
                      </div>
                      <div className="mt-1 text-xs">
                        <span className="line-through text-red-400">{mod.field === 'amount' && mod.old_value ? `${fmt(mod.old_value)} Bs` : mod.old_value || '(vacio)'}</span>
                        {' → '}
                        <span className="text-green-600 font-medium">{mod.field === 'amount' && mod.new_value ? `${fmt(mod.new_value)} Bs` : mod.new_value || '(vacio)'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-2">Sin modificaciones.</p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

export default TransactionsPage;
