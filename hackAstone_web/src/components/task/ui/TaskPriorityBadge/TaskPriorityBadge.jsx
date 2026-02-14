import './TaskPriorityBadge.css';

export const TaskPriorityBadge = ({ priority = 0 }) => {
  const getPriorityInfo = (priority) => {
    const configs = {
      0: { label: '低', bg: '#F9FAFB', border: '#E5E7EB', text: '#4A5565' },
      1: { label: '中', bg: '#FEFCE8', border: '#FFF085', text: '#D08700' },
      2: { label: '高', bg: '#FEF2F2', border: '#FFC9C9', text: '#E7000B' },
    };
    return configs[priority] || configs[0];
  };

  const info = getPriorityInfo(priority);

  return (
    <span
      className="task-priority-badge"
      style={{
        backgroundColor: info.bg,
        borderColor: info.border,
        color: info.text,
      }}
    >
      {info.label}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 1L7.5 4.5L11 5.5L8.5 8L9 11.5L6 9.5L3 11.5L3.5 8L1 5.5L4.5 4.5L6 1Z" fill="currentColor" fillOpacity="0.5"/>
      </svg>
    </span>
  );
};

