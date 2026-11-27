import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

interface Achievement {
  id: number;
  type: string;
  name: string;
  description: string | null;
  amount: string | null;
  completed_at: string;
}

interface DashboardData {
  achievements: Achievement[];
}

function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<DashboardData>('/dashboard')
      .then((data) => setAchievements(data.achievements))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 rounded-full border-2 border-primary-600 border-r-transparent animate-spin" role="status" aria-label="Cargando" />
      </div>
    );
  }

  const objectives = achievements.filter((a) => a.type === 'objective');
  const projects = achievements.filter((a) => a.type === 'project');

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <PageHeader title="Mis logros" />
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {achievements.length > 0 ? (
          <>
            {objectives.length > 0 && (
              <section className="card">
                <h3 className="card-title">Objetivos completados</h3>
                <div className="space-y-3">
                  {objectives.map((a) => (
                    <div key={a.id} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm text-gray-900">✅ {a.name}</p>
                        <p className="text-xs text-gray-400">{formatDate(a.completed_at)}</p>
                      </div>
                      {a.amount && (
                        <span className="text-xs text-gray-500">{parseFloat(a.amount).toFixed(2)} Bs</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {projects.length > 0 && (
              <section className="card">
                <h3 className="card-title">Proyectos completados</h3>
                <div className="space-y-3">
                  {projects.map((a) => (
                    <div key={a.id} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm text-gray-900">🏆 {a.name}</p>
                        <p className="text-xs text-gray-400">{formatDate(a.completed_at)}</p>
                      </div>
                      {a.amount && (
                        <span className="text-xs text-gray-500">{parseFloat(a.amount).toFixed(2)} Bs</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section className="card">
            <EmptyState message="Aquí aparecerán tus objetivos y proyectos completados." />
          </section>
        )}
      </div>
    </>
  );
}

export default AchievementsPage;
