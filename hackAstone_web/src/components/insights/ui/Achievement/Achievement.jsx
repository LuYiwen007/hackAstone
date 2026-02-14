import './Achievement.css';

export const Achievement = ({ achievements = [] }) => {
  return (
    <div className="achievement">
      <div className="achievement-header">
        <h2 className="achievement-title">最近成就</h2>
        <button className="achievement-filter">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H21M7 12H17M10 18H14" stroke="#4A5565" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="achievement-list">
        {achievements.map((achievement, index) => (
          <div key={index} className="achievement-item">
            <div className="achievement-content">
              <div className="achievement-info">
                <p className="achievement-name">{achievement.name}</p>
                <div className="achievement-date">
                  <span>{achievement.date}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2H10V10H2V2Z" stroke="#4A5565" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M3 1V3M9 1V3" stroke="#4A5565" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              <div className="achievement-icon">{achievement.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

