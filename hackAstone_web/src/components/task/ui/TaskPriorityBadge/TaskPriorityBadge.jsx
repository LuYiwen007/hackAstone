import './TaskPriorityBadge.css';

export const TaskPriorityBadge = ({ priority = 0 }) => {
  const getPriorityInfo = (priority) => {
    const configs = {
      0: { label: '低', bg: '#F3F4F6', text: '#364153' },
      1: { label: '中', bg: '#D08700', text: '#FFFFFF' },
      2: { label: '高', bg: '#C10007', text: '#FFFFFF' },
    };
    return configs[priority] || configs[0];
  };

  const info = getPriorityInfo(priority);

  return (
    <span
      className="task-priority-badge"
      style={{
        backgroundColor: info.bg,
        color: info.text,
      }}
    >
      {info.label}
    </span>
  );
};

