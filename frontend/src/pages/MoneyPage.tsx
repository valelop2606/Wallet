import { NavLink, Outlet } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';

function MoneyPage() {
  return (
    <>
      <PageHeader title="Dinero" />
      <div className="max-w-lg mx-auto px-4 pt-3">
        {/* Sub-navigation tabs */}
        <div className="segmented mb-4">
          <NavLink
            to="/money/sources"
            className={({ isActive }) =>
              `segmented-item${isActive ? ' active' : ''}`
            }
          >
            <Icon name="coins" size={16} />
            Fuentes
          </NavLink>
          <NavLink
            to="/money/transactions"
            className={({ isActive }) =>
              `segmented-item${isActive ? ' active' : ''}`
            }
          >
            <Icon name="list" size={16} />
            Movimientos
          </NavLink>
        </div>
      </div>
      <Outlet />
    </>
  );
}

export default MoneyPage;
