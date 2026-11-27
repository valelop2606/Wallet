import { Outlet, NavLink } from 'react-router-dom';
import Icon, { IconName } from './Icon';

const navItems: { to: string; label: string; icon: IconName }[] = [
  { to: '/dashboard', label: 'Inicio', icon: 'home' },
  { to: '/money', label: 'Dinero', icon: 'wallet' },
  { to: '/plans', label: 'Planes', icon: 'target' },
  { to: '/savings', label: 'Ahorros', icon: 'piggy' },
  { to: '/achievements', label: 'Logros', icon: 'trophy' },
];

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <main>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg shadow-nav pb-safe"
        aria-label="Navegación principal"
      >
        <div className="max-w-lg mx-auto grid grid-cols-5 px-2 pt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 transition-colors duration-150 ${
                  isActive ? 'text-primary-700' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors duration-200 ${
                      isActive ? 'bg-primary-100' : 'bg-transparent'
                    }`}
                  >
                    <Icon name={item.icon} size={20} strokeWidth={isActive ? 2.1 : 1.8} />
                  </span>
                  <span className="text-[11px] font-semibold leading-none">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default Layout;
