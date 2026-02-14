import './UsageChart.css';

export const UsageChart = ({ data = [] }) => {
  // 简单的图表展示，实际可以使用图表库如 Chart.js
  if (!data || data.length === 0) {
    return (
      <div className="usage-chart-empty">
        <p>暂无数据</p>
      </div>
    );
  }

  return (
    <div className="usage-chart">
      <h3 className="usage-chart-title">使用趋势</h3>
      <div className="usage-chart-placeholder">
        <p>图表展示区域</p>
        <p className="usage-chart-note">（可集成 Chart.js 等图表库）</p>
      </div>
    </div>
  );
};

