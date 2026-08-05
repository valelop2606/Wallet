import { Outlet, NavLink } from 'react-router-dom';

function Layout() {
  const navItems = [
    { to: '/dashboard', label: 'Inicio', icon: '🏠' },
    { to: '/money', label: 'Dinero', icon: '💸' },
    { to: '/plans', label: 'Planes', icon: '🎯' },
    { to: '/savings', label: 'Ahorros', icon: '💰' },
    { to: '/achievements', label: 'Logros', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <span className="text-xl" role="img" aria-label={item.label}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default Layout;
