import './HomePage.css';

// 模拟数据
const stats = {
  activePlans: 3,
  tasksCompleted: 24,
  studyStreak: '7 days',
  timeSpent: '12.5h',
};

const recentActivities = [
  { id: 1, title: '完成数学作业', time: '2小时前', color: '#00C950' },
  { id: 2, title: '开始英语学习计划', time: '5小时前', color: '#2B7FFF' },
  { id: 3, title: '复习物理第三章', time: '昨天', color: '#AD46FF' },
];

const upcomingDeadlines = [
  { id: 1, title: 'Python项目提交', time: '明天', priority: '高', priorityColor: '#C10007' },
  { id: 2, title: '历史论文撰写', time: '3天后', priority: '中', priorityColor: '#A65F00' },
  { id: 3, title: '化学实验报告', time: '5天后', priority: '低', priorityColor: '#364153' },
];

const activePlans = [
  {
    id: 1,
    title: '数学复习计划',
    progress: 65,
    expected: 80,
    status: '落后',
    statusColor: '#F0B100',
  },
  {
    id: 2,
    title: 'Python编程学习',
    progress: 40,
    expected: 45,
    status: '正常',
    statusColor: '#00C950',
  },
  {
    id: 3,
    title: '英语口语提升',
    progress: 80,
    expected: 75,
    status: '正常',
    statusColor: '#00C950',
  },
];

export const HomePage = () => {
  return (
    <div className="home-page">
      {/* 欢迎区域 */}
      <div className="home-welcome">
        <h1 className="home-welcome-title">欢迎回来！</h1>
        <p className="home-welcome-subtitle">让我们继续你的学习之旅</p>
      </div>

      {/* 统计卡片 */}
      <div className="home-stats">
        <div className="home-stat-card">
          <div className="home-stat-icon">📋</div>
          <div className="home-stat-value">{stats.activePlans}</div>
          <div className="home-stat-label">Active Plans</div>
        </div>
        <div className="home-stat-card">
          <div className="home-stat-icon">✅</div>
          <div className="home-stat-value">{stats.tasksCompleted}</div>
          <div className="home-stat-label">Tasks Completed</div>
        </div>
        <div className="home-stat-card">
          <div className="home-stat-icon">🔥</div>
          <div className="home-stat-value">{stats.studyStreak}</div>
          <div className="home-stat-label">Study Streak</div>
        </div>
        <div className="home-stat-card">
          <div className="home-stat-icon">⏱️</div>
          <div className="home-stat-value">{stats.timeSpent}</div>
          <div className="home-stat-label">Time Spent</div>
        </div>
      </div>

      {/* 最近活动和即将到期 */}
      <div className="home-activities">
        <div className="home-activity-card">
          <h2 className="home-card-title">最近活动</h2>
          <div className="home-activity-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="home-activity-item">
                <div className="home-activity-content">
                  <div className="home-activity-title">{activity.title}</div>
                  <div className="home-activity-time">{activity.time}</div>
                </div>
                <div
                  className="home-activity-dot"
                  style={{ backgroundColor: activity.color }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="home-activity-card">
          <h2 className="home-card-title">即将到期</h2>
          <div className="home-activity-list">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="home-deadline-item">
                <div className="home-deadline-content">
                  <div className="home-deadline-title">{deadline.title}</div>
                  <div className="home-deadline-time">{deadline.time}</div>
                </div>
                <div
                  className="home-deadline-priority"
                  style={{
                    backgroundColor:
                      deadline.priority === '高'
                        ? '#FFE2E2'
                        : deadline.priority === '中'
                        ? '#FEF9C2'
                        : '#F3F4F6',
                    color:
                      deadline.priority === '高'
                        ? '#C10007'
                        : deadline.priority === '中'
                        ? '#A65F00'
                        : '#364153',
                  }}
                >
                  {deadline.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 活跃计划 */}
      <div className="home-plans-card">
        <h2 className="home-card-title">活跃计划</h2>
        <div className="home-plans-list">
          {activePlans.map((plan) => (
            <div key={plan.id} className="home-plan-item">
              <div className="home-plan-content">
                <div className="home-plan-icon">📚</div>
                <div className="home-plan-info">
                  <div className="home-plan-title">{plan.title}</div>
                  <div className="home-plan-progress">
                    进度: {plan.progress}% / 预期: {plan.expected}%
                  </div>
                </div>
              </div>
              <div
                className="home-plan-status"
                style={{
                  backgroundColor:
                    plan.status === '落后' ? '#FEFCE8' : '#F0FDF4',
                  color: plan.statusColor,
                }}
              >
                {plan.status === '落后' && '⚠️ '}
                {plan.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

