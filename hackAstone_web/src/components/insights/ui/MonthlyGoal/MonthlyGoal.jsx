import './MonthlyGoal.css';

export const MonthlyGoal = ({ goals = [] }) => {
  return (
    <div className="monthly-goal">
      <div className="monthly-goal-header">
        <h2 className="monthly-goal-title">本月目标</h2>
        <button className="monthly-goal-filter">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H21M7 12H17M10 18H14" stroke="#4A5565" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="monthly-goal-list">
        {goals.map((goal, index) => {
          const percentage = (goal.current / goal.target) * 100;
          
          return (
            <div key={index} className="monthly-goal-item">
              <div className="monthly-goal-info">
                <span className="monthly-goal-name">{goal.name}</span>
                <span className="monthly-goal-progress">
                  {goal.current} / {goal.target}
                </span>
              </div>
              <div className="monthly-goal-bar">
                <div 
                  className="monthly-goal-bar-fill" 
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

