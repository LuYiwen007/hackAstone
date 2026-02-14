import { TaskPriorityBadge } from '../TaskPriorityBadge';
import './TaskItem.css';

export const TaskItem = ({ task, onToggle }) => {
  const isCompleted = task.completed || false;

  return (
    <div className={`task-item ${isCompleted ? 'task-item-completed' : ''}`}>
      <div className="task-item-content">
        <div className="task-item-main">
          <h4 className="task-item-title">{task.title}</h4>
          <div className="task-item-meta">
            <TaskPriorityBadge priority={task.priority || 0} />
            <div className="task-item-duration">
              <span>{task.duration || '30分钟'}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 4V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="task-item-time">{task.time || '09:00'}</span>
          </div>
        </div>
        <button
          className="task-item-checkbox"
          onClick={() => onToggle && onToggle(task.id)}
          aria-label={isCompleted ? '标记为未完成' : '标记为完成'}
        >
          {isCompleted ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="#155DFC"/>
              <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="4" stroke="#E5E7EB" strokeWidth="1.5"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

