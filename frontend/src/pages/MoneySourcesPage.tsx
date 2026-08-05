import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

interface MoneySource {
  id: number;
  name: string;
  type: string;
  balance: string;
  description: string | null;
}

function MoneySourcesPage() {
  const [sources, setSources] = useState<MoneySource[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('physical');
  const [balance, setBalance] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadSources = () => {
    apiFetch<{ sources: MoneySource[]; total: number }>('/sources')
      .then((data) => {
        setSources(data.sources);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch('/sources', {
        method: 'POST',
        body: JSON.stringify({
          name,
          type,
          balance: balance ? parseFloat(balance) : 0,
        }),
      });
      setName('');
      setType('physical');
      setBalance('');
      setShowCreate(false);
      loadSources();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (n: number | string) => {
    const num = typeof n === 'string' ? parseFloat(n) : n;
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const typeIcons: Record<string, string> = {
    physical: '💵',
    bank: '🏦',
    other: '📦',
  };

  const typeLabels: Record<string, string> = {
    physical: 'Física',
    bank: 'Banco',
    other: 'Otro',
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
        {/* Total */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total disponible</p>
          <p className="text-2xl font-bold text-gray-900">{fmt(total)} Bs</p>
        </section>

        {/* Sources List */}
        {sources.length > 0 ? (
          <section className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            {sources.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{typeIcons[s.type] || '📦'}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">{typeLabels[s.type] || s.type}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">{fmt(s.balance)} Bs</span>
              </div>
            ))}
          </section>
        ) : (
          <section className="bg-white rounded-2xl p-5 shadow-sm">
            <EmptyState
              message="Todavía no tienes dinero registrado. Agrega tu primera fuente para comenzar."
              actionLabel="+ Nueva fuente"
              onAction={() => setShowCreate(true)}
            />
          </section>
        )}

        {/* Add Button */}
        <button
          onClick={() => setShowCreate(true)}
          className="w-full py-3 bg-white rounded-2xl shadow-sm text-primary-600 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          + Nueva fuente
        </button>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nueva fuente">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="source-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              id="source-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: Billetera"
            />
          </div>
          <div>
            <label htmlFor="source-type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              id="source-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="physical">Física</option>
              <option value="bank">Banco</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div>
            <label htmlFor="source-balance" className="block text-sm font-medium text-gray-700 mb-1">
              Saldo inicial
            </label>
            <input
              id="source-balance"
              type="number"
              min="0"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0.00"
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
    </>
  );
}

export default MoneySourcesPage;
