import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { TaskGroup } from '../../components/task';
import { formatFullDate } from '../../shared/utils/format';
import './TasksPage.css';

// 模拟数据
const mockTaskGroups = [
  {
    id: '1',
    title: '数学复习计划',
    icon: '📐',
    color: '#2B7FFF',
    completedCount: 1,
    totalCount: 3,
    index: 0,
    tasks: [
      {
        id: '1-1',
        title: '复习导数概念',
        priority: 2,
        duration: '30分钟',
        time: '09:00',
        completed: false,
      },
      {
        id: '1-2',
        title: '完成习题集第3章',
        priority: 2,
        duration: '45分钟',
        time: '14:00',
        completed: false,
      },
      {
        id: '1-3',
        title: '观看线性代数视频',
        priority: 1,
        duration: '1小时',
        time: '19:00',
        completed: false,
      },
    ],
  },
  {
    id: '2',
    title: 'Python编程学习',
    icon: '🐍',
    color: '#00C950',
    completedCount: 2,
    totalCount: 3,
    index: 1,
    tasks: [
      {
        id: '2-1',
        title: '学习列表推导式',
        priority: 1,
        duration: '20分钟',
        time: '10:00',
        completed: true,
      },
      {
        id: '2-2',
        title: '完成函数练习',
        priority: 2,
        duration: '40分钟',
        time: '15:00',
        completed: true,
      },
      {
        id: '2-3',
        title: '阅读装饰器文档',
        priority: 1,
        duration: '30分钟',
        time: '20:00',
        completed: false,
      },
    ],
  },
  {
    id: '3',
    title: '英语口语提升',
    icon: '🗣️',
    color: '#AD46FF',
    completedCount: 2,
    totalCount: 3,
    index: 2,
    tasks: [
      {
        id: '3-1',
        title: '晨读30分钟',
        priority: 2,
        duration: '30分钟',
        time: '07:00',
        completed: true,
      },
      {
        id: '3-2',
        title: '跟读TED演讲',
        priority: 1,
        duration: '20分钟',
        time: '12:00',
        completed: true,
      },
      {
        id: '3-3',
        title: '口语练习APP',
        priority: 0,
        duration: '25分钟',
        time: '21:00',
        completed: false,
      },
    ],
  },
];

export const TasksPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('today'); // today, all, completed
  const [taskGroups, setTaskGroups] = useState(mockTaskGroups);

  const handleTaskToggle = (taskId) => {
    setTaskGroups((groups) =>
      groups.map((group) => ({
        ...group,
        tasks: group.tasks.map((task) =>
          task.id === taskId
            ? { ...task, completed: !task.completed }
            : task
        ),
        completedCount: group.tasks.filter(
          (t) => (t.id === taskId ? !t.completed : t.completed)
        ).length,
      }))
    );
  };

  // 计算今日任务完成度
  const todayTasks = taskGroups.flatMap((group) => group.tasks);
  const completedToday = todayTasks.filter((t) => t.completed).length;
  const totalToday = todayTasks.length;
  const progressPercentage = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  // 筛选任务：今日任务和全部任务都显示所有任务（勾选后不消失，仅在前面的圆点打勾）
  const getFilteredGroups = () => {
    if (filter === 'completed') {
      return taskGroups.map((group) => ({
        ...group,
        tasks: group.tasks.filter((t) => t.completed),
      })).filter((group) => group.tasks.length > 0);
    }
    // 今日任务 / 全部任务：显示所有任务，点击后只在圆点打勾，任务保留在列表中
    return taskGroups;
  };

  const filteredGroups = getFilteredGroups();
  const todayDate = formatFullDate(new Date());

  return (
    <div className="tasks-page">
      <div className="tasks-page-container">
        <div className="tasks-page-header">
          <div className="tasks-page-title-section">
            <h1 className="tasks-page-title">任务列表</h1>
            <p className="tasks-page-description">管理你的日常学习任务</p>
          </div>
          <Button
            variant="primary"
            size="medium"
            onClick={() => navigate('/task/create')}
          >
            新建任务
          </Button>
        </div>

        <div className="tasks-page-progress-card">
          <div className="tasks-page-progress-header">
            <div className="tasks-page-progress-date">
              <h2>{todayDate}</h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="tasks-page-progress-content">
            <div className="tasks-page-progress-info">
              <span className="tasks-page-progress-label">今日任务完成度</span>
              <span className="tasks-page-progress-count">
                {completedToday} / {totalToday}
              </span>
            </div>
            <div className="tasks-page-progress-bar">
              <div
                className="tasks-page-progress-bar-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="tasks-page-filters">
          <button
            className={`tasks-page-filter-btn ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
          >
            今日任务
          </button>
          <button
            className={`tasks-page-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            全部任务
          </button>
          <button
            className={`tasks-page-filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            已完成
          </button>
        </div>

        <div className="tasks-page-list">
          {filteredGroups.length === 0 ? (
            <div className="tasks-page-empty">
              <p>暂无任务</p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <TaskGroup
                key={group.id}
                plan={group}
                tasks={group.tasks}
                onTaskToggle={handleTaskToggle}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
