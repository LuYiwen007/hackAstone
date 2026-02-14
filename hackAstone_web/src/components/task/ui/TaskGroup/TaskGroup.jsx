import { useNavigate } from 'react-router-dom';
import { TaskItem } from '../TaskItem';
import './TaskGroup.css';

const PLAN_COLORS = {
  default: '#2B7FFF',
  green: '#00C950',
  purple: '#AD46FF',
};

export const TaskGroup = ({ plan, tasks = [], onTaskToggle }) => {
  const navigate = useNavigate();
  
  const getPlanColor = (index) => {
    const colors = Object.values(PLAN_COLORS);
    return colors[index % colors.length] || PLAN_COLORS.default;
  };

  const planColor = plan.color || getPlanColor(plan.index || 0);

  return (
    <div className="task-group">
      <div className="task-group-header" style={{ backgroundColor: planColor }}>
        <div className="task-group-header-left">
          <div className="task-group-icon">
            {plan.icon || '📚'}
          </div>
          <div className="task-group-info">
            <h3 className="task-group-title">{plan.title}</h3>
            <p className="task-group-progress">
              今日 {plan.completedCount || 0}/{plan.totalCount || 0} 任务完成
            </p>
          </div>
        </div>
        <button
          className="task-group-link"
          onClick={() => navigate(`/plan/${plan.id}`)}
        >
          点击查看详情 →
        </button>
      </div>
      <div className="task-group-tasks">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onTaskToggle}
          />
        ))}
      </div>
    </div>
  );
};

