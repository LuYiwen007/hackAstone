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
      2: { bg: '#FFE2E2', text: '#C10007' }
    };
    return colors[priority] || colors[0];
  };

  const getStatusColor = () => {
    if (plan.progress !== undefined && plan.expected !== undefined) {
      if (plan.progress < plan.expected) {
        return { bg: '#FEFCE8', text: '#F0B100' };
      } else {
        return { bg: '#F0FDF4', text: '#00C950' };
      }
    }
    return { bg: '#F0FDF4', text: '#00C950' };
  };

  const statusInfo = getStatusColor();
  const priorityInfo = getPriorityColor(plan.priority || 0);

  return (
    <div className="plan-card" onClick={handleClick}>
      <div className="plan-card-content">
        <div className="plan-card-icon">📚</div>
        <div className="plan-card-info">
          <div className="plan-card-header">
            <h3 className="plan-card-title">{plan.title}</h3>
            <div 
              className="plan-card-status"
              style={{
                backgroundColor: statusInfo.bg,
                color: statusInfo.text,
              }}
            >
              {plan.progress !== undefined && plan.expected !== undefined
                ? plan.progress < plan.expected
                  ? '⚠️ 落后'
                  : '正常'
                : '正常'}
            </div>
          </div>
          <div className="plan-card-progress">
            进度: {plan.progress || 0}% / 预期: {plan.expected || 0}%
          </div>
        </div>
      </div>
      
      {plan.description && (
        <p className="plan-card-description">{plan.description}</p>
      )}
      
      <div className="plan-card-meta">
        <div className="plan-card-dates">
          {plan.start_date && (
            <span className="plan-card-date">
              📅 {formatDate(plan.start_date)}
            </span>
          )}
          {plan.end_date && (
            <span className="plan-card-date">
              ⏰ {formatDate(plan.end_date)}
            </span>
          )}
        </div>
        <div 
          className="plan-card-priority"
          style={{
            backgroundColor: priorityInfo.bg,
            color: priorityInfo.text,
          }}
        >
          {getPriorityLabel(plan.priority || 0)}
        </div>
      </div>
    </div>
  );
};

