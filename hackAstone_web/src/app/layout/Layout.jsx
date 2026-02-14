import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';

const tabs = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'plans', label: 'Plans', path: '/plans' },
  { id: 'tasks', label: 'Tasks', path: '/tasks' },
  { id: 'review', label: 'Review', path: '/review' },
  { id: 'insights', label: 'Insights', path: '/insights' },
];

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-container">
          <div className="layout-logo">
            <div className="layout-logo-icon">U</div>
            <span className="layout-logo-text">UrPlans</span>
          </div>
          
          <nav className="layout-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`layout-nav-link ${isActive(tab.path) ? 'active' : ''}`}
                onClick={() => navigate(tab.path)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="layout-header-actions">
            <button 
              className="layout-user-button"
              onClick={() => navigate('/settings')}
            >
              👤
            </button>
          </div>
        </div>
      </header>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
};

