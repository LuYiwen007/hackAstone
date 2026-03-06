import { TaskPriorityBadge } from '../TaskPriorityBadge';
import './TaskItem.css';

export const TaskItem = ({ task, onToggle }) => {
  const isCompleted = task.completed || false;

  return (
    <div className={`task-item ${isCompleted ? 'task-item-completed' : ''}`}>
      <button
        type="button"
        className="task-item-checkbox"
        onClick={() => onToggle?.(task.id)}
        aria-label={isCompleted ? '标记为未完成' : '标记为完成'}
      >
        {isCompleted ? (
          <span className="task-item-checkbox-done">
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
              <path d="M1 5L5 9L13 1" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ) : (
          <span className="task-item-checkbox-empty" />
        )}
      </button>
      <span className="task-item-title">{task.title}</span>
      <div className="task-item-time-wrap">
        <svg className="task-item-clock" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 4V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>{task.duration || '30分钟'}</span>
        <span className="task-item-time">{task.time || '09:00'}</span>
      </div>
      <TaskPriorityBadge priority={task.priority ?? 0} />
    </div>
  );
};

