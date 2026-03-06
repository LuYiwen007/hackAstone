import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../../shared/utils/format';
import './PlanCard.css';

export const PlanCard = ({ plan }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/plan/${plan.id}`);
  };

  const getPriorityLabel = (priority) => {
    const labels = { 0: '低', 1: '中', 2: '高' };
    return labels[priority] || '低';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      0: { bg: '#F3F4F6', text: '#364153' },
      1: { bg: '#FEF9C2', text: '#A65F00' },
      2: { bg: '#FFE2E2', text: '#C10007' },
    };
    return colors[priority] || colors[0];
  };

  const getStatusColor = () => {
    if (plan.progress !== undefined && plan.expected !== undefined) {
      if (plan.progress < plan.expected) {
        return { bg: '#FEFCE8', text: '#F0B100' };
      }
      return { bg: '#F0FDF4', text: '#00C950' };
    }
    return { bg: '#F0FDF4', text: '#00C950' };
  };

  const statusInfo = getStatusColor();
  const priorityInfo = getPriorityColor(plan.priority || 0);
  const progress = plan.progress ?? 0;
  const expected = plan.expected ?? 0;
  const progressPercent = expected > 0 ? Math.min(100, Math.round((progress / expected) * 100)) : 0;

  return (
    <div className="plan-card plan-card-grid" onClick={handleClick}>
      <div className="plan-card-grid-top">
        <div className="plan-card-grid-icon">📚</div>
        <div className="plan-card-grid-status" style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}>
          {plan.progress !== undefined && plan.expected !== undefined
            ? plan.progress < plan.expected
              ? '落后'
              : '正常'
            : '正常'}
        </div>
      </div>
      <h3 className="plan-card-grid-title">{plan.title}</h3>
      {plan.description && (
        <p className="plan-card-grid-desc">{plan.description}</p>
      )}
      <div className="plan-card-grid-progress-wrap">
        <div className="plan-card-grid-progress-bar">
          <div
            className="plan-card-grid-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="plan-card-grid-progress-text">{progress}% / {expected}%</span>
      </div>
      <div className="plan-card-grid-meta">
        {plan.start_date && (
          <span className="plan-card-grid-date">{formatDate(plan.start_date)}</span>
        )}
        <span
          className="plan-card-grid-priority"
          style={{ backgroundColor: priorityInfo.bg, color: priorityInfo.text }}
        >
          {getPriorityLabel(plan.priority || 0)}
        </span>
      </div>
    </div>
  );
};
