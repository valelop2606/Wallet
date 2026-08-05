import { useAuth } from '../hooks/useAuth';

interface PageHeaderProps {
  title: string;
  showLogout?: boolean;
}

function PageHeader({ title, showLogout = false }: PageHeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        {showLogout && (
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar sesión"
          >
            Salir
          </button>
        )}
      </div>
    </header>
  );
}

export default PageHeader;
