import { NavLink, Outlet } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

function MoneyPage() {
  return (
    <>
      <PageHeader title="Dinero" />
      <div className="max-w-lg mx-auto px-4 pt-3">
        {/* Sub-navigation tabs */}
        <div className="flex gap-2 mb-4">
          <NavLink
            to="/money/sources"
            className={({ isActive }) =>
              `flex-1 text-center py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'
              }`
            }
          >
            💵 Fuentes
          </NavLink>
          <NavLink
            to="/money/transactions"
            className={({ isActive }) =>
              `flex-1 text-center py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'
              }`
            }
          >
            📝 Movimientos
          </NavLink>
        </div>
      </div>
      <Outlet />
    </>
  );
}

export default MoneyPage;
