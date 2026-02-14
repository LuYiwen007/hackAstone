import './UsageStats.css';

export const UsageStats = ({ stats }) => {
  const defaultStats = {
    totalPlans: stats?.totalPlans || 0,
    completedPlans: stats?.completedPlans || 0,
    inProgressPlans: stats?.inProgressPlans || 0,
    totalViews: stats?.totalViews || 0,
  };

  const completionRate = defaultStats.totalPlans > 0 
    ? Math.round((defaultStats.completedPlans / defaultStats.totalPlans) * 100)
    : 0;

  return (
    <div className="usage-stats">
      <div className="usage-stats-grid">
        <div className="usage-stat-card">
          <div className="usage-stat-value">{defaultStats.totalPlans}</div>
          <div className="usage-stat-label">总计划数</div>
        </div>
        <div className="usage-stat-card">
          <div className="usage-stat-value">{defaultStats.completedPlans}</div>
          <div className="usage-stat-label">已完成</div>
        </div>
        <div className="usage-stat-card">
          <div className="usage-stat-value">{defaultStats.inProgressPlans}</div>
          <div className="usage-stat-label">进行中</div>
        </div>
        <div className="usage-stat-card">
          <div className="usage-stat-value">{completionRate}%</div>
          <div className="usage-stat-label">完成率</div>
        </div>
      </div>
    </div>
  );
};

