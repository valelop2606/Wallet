import { NavLink, Outlet } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Icon from '../components/Icon';

function PlansPage() {
  return (
    <>
      <PageHeader title="Planes" />
      <div className="max-w-lg mx-auto px-4 pt-3">
        {/* Sub-navigation tabs */}
        <div className="segmented mb-4">
          <NavLink
            to="/plans/objectives"
            className={({ isActive }) =>
              `segmented-item${isActive ? ' active' : ''}`
            }
          >
            <Icon name="target" size={16} />
            Objetivos
          </NavLink>
          <NavLink
            to="/plans/projects"
            className={({ isActive }) =>
              `segmented-item${isActive ? ' active' : ''}`
            }
          >
            <Icon name="folder" size={16} />
            Proyectos
          </NavLink>
        </div>
      </div>
      <Outlet />
    </>
  );
}

export default PlansPage;
