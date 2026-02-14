import './PlanStatusBadge.css';

const STATUS_CONFIG = {
  NOT_STARTED: { label: '未开始', color: '#6c757d' },
  IN_PROGRESS: { label: '执行中', color: '#007bff' },
  PAUSED: { label: '暂停', color: '#ffc107' },
  COMPLETED: { label: '完成', color: '#28a745' },
  FAILED: { label: '失败', color: '#dc3545' },
  DELAYED: { label: '延期', color: '#fd7e14' },
};

export const PlanStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_STARTED;
  
  return (
    <span 
      className="plan-status-badge"
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      {config.label}
    </span>
  );
};

