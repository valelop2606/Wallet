import { NavLink, Outlet } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

function PlansPage() {
  return (
    <>
      <PageHeader title="Planes" />
      <div className="max-w-lg mx-auto px-4 pt-3">
        {/* Sub-navigation tabs */}
        <div className="flex gap-2 mb-4">
          <NavLink
            to="/plans/objectives"
            className={({ isActive }) =>
              `flex-1 text-center py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'
              }`
            }
          >
            🎯 Objetivos
          </NavLink>
          <NavLink
            to="/plans/projects"
            className={({ isActive }) =>
              `flex-1 text-center py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'
              }`
            }
          >
            🚀 Proyectos
          </NavLink>
        </div>
      </div>
      <Outlet />
    </>
  );
}

export default PlansPage;
