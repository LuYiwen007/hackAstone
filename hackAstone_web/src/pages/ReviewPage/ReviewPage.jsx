import { Button } from '../../shared/ui/Button';
import { WeeklyChart, ReviewRecord, TestResult } from '../../components/review';
import './ReviewPage.css';

// 模拟数据
const weeklyData = [
  { value: 3.6 },
  { value: 2.7 },
  { value: 1.8 },
  { value: 0.9 },
  { value: 2.5 },
  { value: 3.2 },
  { value: 1.5 },
];

const reviewRecords = [
  {
    id: '1',
    planTitle: '数学复习计划',
    icon: '📐',
    date: '2026-02-13',
    timeRange: '晚上 19:00-21:00',
    duration: '2小时',
    status: 'today',
    summary: '今天复习了微积分的极限与连续性概念。极限的定义理解得还不够深刻，特别是ε-δ定义需要多看几遍。做了20道练习题，错了3道，主要是计算粗心。明天继续复习导数部分。',
    tags: ['极限', '连续性', 'ε-δ定义'],
  },
  {
    id: '2',
    planTitle: 'Python编程学习',
    icon: '🐍',
    date: '2026-02-12',
    timeRange: '下午 14:00-15:30',
    duration: '1.5小时',
    status: 'past',
    summary: '学习了Python的函数和模块。函数的基本概念掌握得比较好，参数传递的几种方式都理解了。模块的导入和使用也没问题。完成了5个编程练习，代码运行都没问题。下次要学习装饰器。',
    tags: ['函数', '模块', '参数传递', 'import'],
  },
  {
    id: '3',
    planTitle: '英语口语提升',
    icon: '🗣️',
    date: '2026-02-12',
    timeRange: '早上 07:00-08:00',
    duration: '1小时',
    status: 'past',
    summary: '今天的晨读和跟读练习。跟读了一段TED演讲，发音比之前流畅了很多。学习了10个新的商务英语短语，需要在日常对话中多练习使用。口语练习APP上完成了3个场景对话。',
    tags: ['晨读', '跟读', '商务英语', '场景对话'],
  },
  {
    id: '4',
    planTitle: '数学复习计划',
    icon: '📐',
    date: '2026-02-10',
    timeRange: '晚上 20:00-22:30',
    duration: '2.5小时',
    status: 'past',
    summary: '回顾了上周学习的微分中值定理，包括罗尔定理、拉格朗日中值定理。这次复习发现之前记得不太清楚的地方都理解了。做了历史习题，准确率提高到90%。',
    tags: ['微分中值定理', '罗尔定理', '拉格朗日定理'],
  },
];

const testResults = [
  {
    id: '1',
    planTitle: '数学复习计划',
    icon: '📐',
    date: '2026-02-13',
    duration: '45分钟',
    status: 'today',
    score: 85,
    level: '良好',
    correct: 8,
    total: 10,
    comment: '整体表现良好，对导数概念掌握扎实，但在极限计算中需要注意细节。建议多练习复合函数求导，加强对链式法则的理解。第3题和第7题出现计算错误，需要提高计算准确性。',
    tags: ['导数', '极限', '连续性'],
  },
  {
    id: '2',
    planTitle: 'Python编程学习',
    icon: '🐍',
    date: '2026-02-12',
    duration: '30分钟',
    status: 'history',
    score: 92,
    level: '优秀',
    correct: 11,
    total: 12,
    comment: '优秀！对Python基础知识掌握牢固，函数和模块理解透彻。唯一错误的题目是关于装饰器的，这是因为还没有深入学习这部分内容。继续保持学习节奏，建议接下来重点学习面向对象编程。',
    tags: ['函数', '列表', '字典', '装饰器'],
  },
  {
    id: '3',
    planTitle: '英语口语提升',
    icon: '🗣️',
    date: '2026-02-11',
    duration: '25分钟',
    status: 'today',
    score: 78,
    level: '良好',
    correct: 7,
    total: 9,
    comment: '口语基础扎实，日常对话表达流畅。需要加强商务英语词汇的积累，特别是正式场合的表达方式。发音准确度很好，但语速可以适当加快，使表达更自然。',
    tags: ['日常对话', '商务英语', '发音'],
  },
];

export const ReviewPage = () => {
  const handleStartTest = () => {
    // TODO: 导航到测试页面
    console.log('开始测试');
  };

  return (
    <div className="review-page">
      <div className="review-page-container">
        <div className="review-page-header">
          <div className="review-page-title-section">
            <h1 className="review-page-title">学习复习</h1>
            <p className="review-page-description">回顾和巩固所学知识</p>
          </div>
        </div>

        <div className="review-page-start-test">
          <div className="review-page-start-test-content">
            <div className="review-page-start-test-icon">📝</div>
            <div className="review-page-start-test-info">
              <h2 className="review-page-start-test-title">开始测试</h2>
              <p className="review-page-start-test-desc">AI 智能生成练习题，实时批改评分</p>
            </div>
          </div>
        </div>

        <WeeklyChart data={weeklyData} totalHours={15.5} />

        <div className="review-page-section">
          <div className="review-page-section-header">
            <h2 className="review-page-section-title">复习记录</h2>
            <button className="review-page-section-filter">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H21M7 12H17M10 18H14" stroke="#4A5565" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="review-page-records">
            {reviewRecords.map((record) => (
              <ReviewRecord key={record.id} record={record} />
            ))}
          </div>
        </div>

        <div className="review-page-section">
          <div className="review-page-section-header">
            <h2 className="review-page-section-title">测试结果</h2>
            <button className="review-page-section-filter">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H21M7 12H17M10 18H14" stroke="#4A5565" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="review-page-tests">
            {testResults.map((result) => (
              <TestResult key={result.id} result={result} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
