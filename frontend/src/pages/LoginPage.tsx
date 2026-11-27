import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Icon from '../components/Icon';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[radial-gradient(900px_420px_at_50%_-10%,rgba(16,185,141,0.16),transparent_70%)]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <span className="flex items-center justify-center w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lift">
            <Icon name="wallet" size={26} strokeWidth={2} />
          </span>
          <h1 className="text-2xl font-bold text-gray-900 amount">Hola de nuevo</h1>
          <p className="mt-1.5 text-sm text-gray-500">Inicia sesión para ver tus finanzas</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4 shadow-xl shadow-gray-900/5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-3.5 py-3 rounded-xl text-sm" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary-700 hover:text-primary-800 font-semibold">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
