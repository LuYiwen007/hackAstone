import { SubjectPerformance, MonthlyGoal, Achievement } from '../../components/insights';
import './InsightsPage.css';

// 模拟数据
const subjects = [
  {
    name: '数学',
    score: 85,
    change: 5,
    color: '#00C950',
  },
  {
    name: '编程',
    score: 78,
    change: 12,
    color: '#2B7FFF',
  },
  {
    name: '英语',
    score: 92,
    change: -3,
    color: '#00C950',
  },
  {
    name: '物理',
    score: 70,
    change: 8,
    color: '#2B7FFF',
  },
];

const monthlyGoals = [
  {
    name: '完成数学复习计划',
    current: 65,
    target: 100,
  },
  {
    name: '学习Python 20小时',
    current: 12,
    target: 20,
  },
  {
    name: '练习英语口语30次',
    current: 24,
    target: 30,
  },
];

const achievements = [
  {
    name: '连续学习7天',
    date: '2026-02-14',
    icon: '🔥',
  },
  {
    name: '完成20个任务',
    date: '2026-02-12',
    icon: '✅',
  },
  {
    name: '学习时长超过50小时',
    date: '2026-02-10',
    icon: '⏰',
  },
];

const suggestions = [
  '你的数学成绩稳步提升，继续保持！建议每天坚持练习30分钟。',
  '编程学习进步明显，可以尝试做一些实践项目来巩固知识。',
  '英语成绩略有下降，建议增加词汇量的复习频率。',
];

export const InsightsPage = () => {
  return (
    <div className="insights-page">
      <div className="insights-page-container">
        <div className="insights-page-header">
          <h1 className="insights-page-title">学习洞察</h1>
          <p className="insights-page-description">分析你的学习数据，获取改进建议</p>
        </div>

        <SubjectPerformance subjects={subjects} />

        <div className="insights-page-row">
          <MonthlyGoal goals={monthlyGoals} />
          <Achievement achievements={achievements} />
        </div>

        <div className="insights-page-suggestions">
          <h2 className="insights-page-suggestions-title">学习建议</h2>
          <div className="insights-page-suggestions-list">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="insights-page-suggestion-item">
                <div className="insights-page-suggestion-dot"></div>
                <p className="insights-page-suggestion-text">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
