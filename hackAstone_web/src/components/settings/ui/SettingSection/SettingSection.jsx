import './SettingSection.css';

export const SettingSection = ({ title, icon, children }) => {
  return (
    <div className="setting-section">
      <div className="setting-section-header">
        <h2 className="setting-section-title">{title}</h2>
        {icon && (
          <button className="setting-section-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21M7 12H17M10 18H14" stroke="#4A5565" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
      <div className="setting-section-content">
        {children}
      </div>
    </div>
  );
};

