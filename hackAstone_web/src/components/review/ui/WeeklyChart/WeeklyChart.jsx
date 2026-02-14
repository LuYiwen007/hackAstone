import './WeeklyChart.css';

export const WeeklyChart = ({ data = [], totalHours = 0 }) => {
  // 默认数据: 周一到周日
  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const maxValue = Math.max(...data.map(d => d.value), 3.6);
  const chartHeight = 240;

  const getBarColor = (value) => {
    if (value >= 3) return '#2B7FFF'; // ≥3小时
    if (value >= 2) return '#51A2FF'; // 2-3小时
    return '#8EC5FF'; // <2小时
  };

  const getBarHeight = (value) => {
    return (value / maxValue) * chartHeight;
  };

  return (
    <div className="weekly-chart">
      <div className="weekly-chart-header">
        <h2 className="weekly-chart-title">本周学习时间</h2>
        <div className="weekly-chart-total">
          <span>{totalHours}小时</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2V10M10 10L14 6M10 10L6 6" stroke="#155DFC" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="10" cy="10" r="8" stroke="#155DFC" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>
      <div className="weekly-chart-content">
        <div className="weekly-chart-bars">
          {weekdays.map((day, index) => {
            const dayData = data[index] || { value: 0 };
            const height = getBarHeight(dayData.value);
            const color = getBarColor(dayData.value);
            
            return (
              <div key={day} className="weekly-chart-bar-group">
                <div className="weekly-chart-bar" style={{ height: `${height}px`, backgroundColor: color }}>
                  {dayData.value > 0 && (
                    <span className="weekly-chart-bar-value">{dayData.value}</span>
                  )}
                </div>
                <div className="weekly-chart-bar-label">{day}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="weekly-chart-legend">
        <div className="weekly-chart-legend-item">
          <div className="weekly-chart-legend-color" style={{ backgroundColor: '#2B7FFF' }}></div>
          <span>≥3小时</span>
        </div>
        <div className="weekly-chart-legend-item">
          <div className="weekly-chart-legend-color" style={{ backgroundColor: '#51A2FF' }}></div>
          <span>2-3小时</span>
        </div>
        <div className="weekly-chart-legend-item">
          <div className="weekly-chart-legend-color" style={{ backgroundColor: '#8EC5FF' }}></div>
          <span>&lt;2小时</span>
        </div>
      </div>
    </div>
  );
};

