import { useAuth } from '../hooks/useAuth';
import Icon from './Icon';

interface PageHeaderProps {
  title: string;
  showLogout?: boolean;
}

function PageHeader({ title, showLogout = false }: PageHeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-gray-50/85 backdrop-blur-lg border-b border-gray-200/60">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-[17px] font-bold text-gray-900">{title}</h1>
        {showLogout && (
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 -mr-2 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar sesión"
          >
            <Icon name="logout" size={16} />
            Salir
          </button>
        )}
      </div>
    </header>
  );
}

export default PageHeader;
